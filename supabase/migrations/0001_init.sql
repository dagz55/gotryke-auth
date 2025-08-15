-- Enable required extensions
create extension if not exists pgcrypto;

-- users_profile: app-level profile linked to auth.users
create table if not exists public.users_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','dispatcher','trider','passenger')) not null,
  full_name text,
  phone text,
  email text,
  toda_id text,
  zones text[] default '{}',
  created_at timestamptz default now()
);

-- rides
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references auth.users(id),
  trider_id uuid references auth.users(id),
  toda_id text,
  origin jsonb not null,
  destination jsonb not null,
  status text check (status in ('requested','assigned','in_progress','completed','canceled')) not null default 'requested',
  fare numeric(10,2),
  created_at timestamptz default now()
);

-- wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id),
  balance numeric(12,2) not null default 0,
  currency text not null default 'PHP',
  updated_at timestamptz default now()
);

-- transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id),
  type text check (type in ('cashin','cashout','ride_charge','refund')) not null,
  amount numeric(12,2) not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- indexes
create index if not exists idx_rides_passenger on public.rides(passenger_id);
create index if not exists idx_rides_trider on public.rides(trider_id);
create index if not exists idx_rides_toda on public.rides(toda_id);
create index if not exists idx_tx_wallet on public.transactions(wallet_id);

-- JWT helper functions
create or replace function public.jwt_role() returns text
language sql stable as $$
  select coalesce( current_setting('request.jwt.claims', true)::jsonb->>'role', '' );
$$;

create or replace function public.jwt_toda() returns text
language sql stable as $$
  select coalesce( current_setting('request.jwt.claims', true)::jsonb->>'toda_id', '' );
$$;

create or replace function public.jwt_zones() returns text[]
language sql stable as $$
  select coalesce( string_to_array( regexp_replace( (current_setting('request.jwt.claims', true)::jsonb->>'zones')::text, '[\[\]\"]','', 'g' ), ','), '{}');
$$;

-- RLS enable
alter table public.users_profile enable row level security;
alter table public.rides enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

-- Policies for users_profile
drop policy if exists profile_self_read on public.users_profile;
create policy profile_self_read on public.users_profile
for select using (
  auth.uid() = user_id
  or public.jwt_role() = 'admin'
  or (public.jwt_role() = 'dispatcher' and public.jwt_toda() <> '' and public.jwt_toda() = toda_id)
);

-- rides policies
drop policy if exists rides_select on public.rides;
create policy rides_select on public.rides
for select using (
  public.jwt_role() = 'admin'
  or (public.jwt_role() = 'passenger' and passenger_id = auth.uid())
  or (public.jwt_role() = 'trider' and trider_id = auth.uid())
  or (public.jwt_role() = 'dispatcher' and toda_id <> '' and toda_id = public.jwt_toda())
);

drop policy if exists rides_insert_passenger on public.rides;
create policy rides_insert_passenger on public.rides
for insert with check (
  (public.jwt_role() = 'passenger' and passenger_id = auth.uid())
  or public.jwt_role() = 'admin'
);

drop policy if exists rides_update_assignment on public.rides;
create policy rides_update_assignment on public.rides
for update using (
  public.jwt_role() in ('admin','dispatcher','trider')
) with check (
  (public.jwt_role() = 'admin')
  or (public.jwt_role() = 'dispatcher' and toda_id = public.jwt_toda())
  or (public.jwt_role() = 'trider' and trider_id = auth.uid())
);

-- wallets policies
drop policy if exists wallets_rw on public.wallets;
create policy wallets_rw on public.wallets
for all using (auth.uid() = user_id or public.jwt_role() = 'admin')
with check (auth.uid() = user_id or public.jwt_role() = 'admin');

-- transactions policies
drop policy if exists tx_read on public.transactions;
create policy tx_read on public.transactions
for select using (
  public.jwt_role() = 'admin' or
  exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())
);

-- triggers
create or replace function public.set_wallet_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_wallet_updated on public.wallets;
create trigger trg_wallet_updated before update on public.wallets
for each row execute function public.set_wallet_updated_at();

-- Wallet helpers (atomic operations)
create or replace function public.wallet_cashin(p_user_id uuid, p_amount numeric, p_meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_wallet_id uuid;
begin
  if public.jwt_role() <> 'admin' and auth.uid() <> p_user_id then
    raise exception 'not allowed';
  end if;
  insert into public.wallets(user_id) values (p_user_id)
  on conflict (user_id) do nothing;
  select id into v_wallet_id from public.wallets where user_id = p_user_id;
  update public.wallets set balance = balance + p_amount where id = v_wallet_id;
  insert into public.transactions(wallet_id, type, amount, meta) values (v_wallet_id, 'cashin', p_amount, coalesce(p_meta,'{}'::jsonb));
end;
$$;

create or replace function public.wallet_cashout(p_user_id uuid, p_amount numeric, p_meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_wallet_id uuid; v_balance numeric;
begin
  if public.jwt_role() <> 'admin' and auth.uid() <> p_user_id then
    raise exception 'not allowed';
  end if;
  select id, balance into v_wallet_id, v_balance from public.wallets where user_id = p_user_id;
  if v_wallet_id is null then
    raise exception 'wallet not found';
  end if;
  if v_balance < p_amount then
    raise exception 'insufficient funds';
  end if;
  update public.wallets set balance = balance - p_amount where id = v_wallet_id;
  insert into public.transactions(wallet_id, type, amount, meta) values (v_wallet_id, 'cashout', p_amount, coalesce(p_meta,'{}'::jsonb));
end;
$$;

-- Charge wallet for ride
create or replace function public.wallet_charge_for_ride(p_user_id uuid, p_amount numeric, p_ride_id uuid, p_meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_wallet_id uuid; v_balance numeric;
begin
  if public.jwt_role() <> 'admin' and auth.uid() <> p_user_id then
    raise exception 'not allowed';
  end if;
  select id, balance into v_wallet_id, v_balance from public.wallets where user_id = p_user_id;
  if v_wallet_id is null then
    insert into public.wallets(user_id) values (p_user_id) returning id, balance into v_wallet_id, v_balance;
  end if;
  if v_balance < p_amount then
    raise exception 'insufficient funds';
  end if;
  update public.wallets set balance = balance - p_amount where id = v_wallet_id;
  insert into public.transactions(wallet_id, type, amount, meta) values (v_wallet_id, 'ride_charge', p_amount, jsonb_build_object('ride_id', p_ride_id) || coalesce(p_meta,'{}'::jsonb));
end;
$$;


