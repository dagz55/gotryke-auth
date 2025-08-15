import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) return new Response('Missing env', { status: 500 });

    const authHeader = req.headers.get('Authorization') ?? '';
    const sbUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
    const { data: me } = await sbUser.auth.getUser();
    const callerRole = (me?.user?.app_metadata as any)?.role;
    if (callerRole !== 'admin') return new Response('Forbidden', { status: 403 });

    const body = await req.json();
    const { user_id, role, toda_id, zones } = body || {};
    if (!user_id || !role) return new Response('Bad Request', { status: 400 });
    if (!['admin','dispatcher','trider','passenger'].includes(role)) return new Response('Invalid role', { status: 400 });

    const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { error: upErr } = await sbAdmin.from('users_profile').upsert({
      user_id,
      role,
      toda_id: toda_id ?? null,
      zones: Array.isArray(zones) ? zones : null
    }, { onConflict: 'user_id' });
    if (upErr) return new Response(JSON.stringify(upErr), { status: 500 });

    const { error: updErr } = await sbAdmin.auth.admin.updateUserById(user_id, {
      app_metadata: { role, toda_id: toda_id ?? '', zones: Array.isArray(zones) ? zones : [] }
    });
    if (updErr) return new Response(JSON.stringify(updErr), { status: 500 });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});


