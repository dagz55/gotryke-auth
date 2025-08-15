import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AuthEvent = {
  type?: string;
  record?: { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> };
};

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env" }), { status: 500 });
    }
    const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const body = (await req.json().catch(() => ({}))) as AuthEvent | Record<string, unknown>;
    // Support both webhook and direct call
    const record = (body as AuthEvent).record as AuthEvent["record"] | undefined;
    const userId = record?.id || (body as any).user_id;
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, reason: "no user id" }), { status: 400 });
    }

    const invite = (body as any).invitation || {};
    const desiredRole = invite.role ?? 'passenger';
    const todaId = invite.toda_id ?? '';
    const zones = Array.isArray(invite.zones) ? invite.zones : [];
    const email = record?.email ?? (body as any).email ?? null;
    const phone = record?.phone ?? (body as any).phone ?? null;

    // upsert users_profile
    const { error: upsertErr } = await sbAdmin.from('users_profile').upsert({
      user_id: userId,
      role: desiredRole,
      email,
      phone,
      toda_id: todaId || null,
      zones: zones.length ? zones : null
    }, { onConflict: 'user_id' });
    if (upsertErr) throw upsertErr;

    // mirror to app_metadata for JWT inclusion
    const { error: updErr } = await sbAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role: desiredRole, toda_id: todaId || '', zones }
    });
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});


