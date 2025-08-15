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
  const path = url.pathname.replace(/^.*\/rides/, '');

  if (req.method === 'POST' && (path === '' || path === '/')) {
    const body = await req.json().catch(() => ({}));
    const { origin, destination, fare } = body || {};
    const insert = {
      passenger_id: user.id,
      origin,
      destination,
      fare: typeof fare === 'number' ? fare : null
    } as any;
    const { data, error } = await sb.from('rides').insert(insert).select('*').single();
    if (error) return json({ error }, 400);
    return json(data, 201);
  }

  if (req.method === 'GET' && path === '/mine') {
    const { data, error } = await sb.from('rides').select('*').order('created_at', { ascending: false });
    if (error) return json({ error }, 400);
    return json(data);
  }

  if (req.method === 'PATCH' && path.match(/^\/[0-9a-fA-F-]+\/assign$/)) {
    const rideId = path.split('/')[1];
    const { trider_id, toda_id } = await req.json().catch(() => ({}));
    const update: Record<string, unknown> = { status: 'assigned' };
    if (trider_id) update.trider_id = trider_id;
    if (toda_id) update.toda_id = toda_id;
    const { data, error } = await sb.from('rides').update(update).eq('id', rideId).select('*').single();
    if (error) return json({ error }, 400);
    return json(data);
  }

  if (req.method === 'PATCH' && path.match(/^\/[0-9a-fA-F-]+\/status$/)) {
    const rideId = path.split('/')[1];
    const { status } = await req.json().catch(() => ({}));
    if (!['assigned','in_progress','completed','canceled','requested'].includes(status)) return json({ error: 'invalid status' }, 400);
    const { data, error } = await sb.from('rides').update({ status }).eq('id', rideId).select('*').single();
    if (error) return json({ error }, 400);
    return json(data);
  }

  return json({ error: 'not_found' }, 404);
});


