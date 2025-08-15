import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const sb = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false }
  });
  const { data: authRes, error: authErr } = await sb.auth.getUser();
  if (authErr || !authRes?.user) return json({ error: 'unauthorized' }, 401);
  const user = authRes.user;
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/wallet/, '');

  if (req.method === 'GET' && (path === '' || path === '/')) {
    // Ensure wallet exists
    await sb.from('wallets').insert({ user_id: user.id }).select('id').single().then(() => {}).catch(() => {});
    const { data, error } = await sb.from('wallets').select('*').eq('user_id', user.id).single();
    if (error) return json({ error }, 400);
    return json(data);
  }

  if (req.method === 'POST' && path === '/cashin') {
    const { amount, meta } = await req.json().catch(() => ({}));
    if (typeof amount !== 'number' || amount <= 0) return json({ error: 'invalid amount' }, 400);
    const { error } = await sb.rpc('wallet_cashin', { p_user_id: user.id, p_amount: amount, p_meta: meta ?? {} });
    if (error) return json({ error }, 400);
    return json({ ok: true });
  }

  if (req.method === 'POST' && path === '/cashout') {
    const { amount, meta } = await req.json().catch(() => ({}));
    if (typeof amount !== 'number' || amount <= 0) return json({ error: 'invalid amount' }, 400);
    const { error } = await sb.rpc('wallet_cashout', { p_user_id: user.id, p_amount: amount, p_meta: meta ?? {} });
    if (error) return json({ error }, 400);
    return json({ ok: true });
  }

  return json({ error: 'not_found' }, 404);
});


