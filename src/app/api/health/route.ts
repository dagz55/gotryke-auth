import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const startedAt = Date.now()
  const results: Record<string, any> = {
    ok: true,
    checks: {},
    durationMs: 0,
    timestamp: new Date().toISOString(),
  }

  // Env checks (do not expose actual values)
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID: !!process.env.TWILIO_VERIFY_SERVICE_SID,
  }
  results.checks.env = envs
  results.ok &&= Object.values(envs).every(Boolean)

  // Supabase DB check (read-only)
  try {
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1)
    results.checks.supabase = { ok: !error, error: error?.message }
    results.ok &&= !error
  } catch (e: any) {
    results.checks.supabase = { ok: false, error: e?.message || 'Unknown error' }
    results.ok = false
  }

  // Twilio Verify service check (if configured)
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
      // Fetch service metadata as a lightweight check
      const svc = await twilio.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).fetch()
      results.checks.twilio = { ok: !!svc?.sid, serviceSid: svc?.sid }
      results.ok &&= !!svc?.sid
    } else {
      results.checks.twilio = { ok: false, error: 'Missing Twilio envs' }
      results.ok = false
    }
  } catch (e: any) {
    results.checks.twilio = { ok: false, error: e?.message || 'Twilio error' }
    results.ok = false
  }

  results.durationMs = Date.now() - startedAt
  const status = results.ok ? 200 : 503
  return NextResponse.json(results, { status })
}


