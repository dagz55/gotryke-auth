import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_local_dev_key'
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'Passw0rd!'
  const sb = createClient(url, service, { auth: { persistSession: false }})

  // Create user if not exists
  const { data: existing } = await sb.from('users_profile').select('user_id').limit(1)
  if (existing && existing.length > 0) {
    console.log('profiles exist; skipping')
  }

  const { data: created, error: cErr } = await sb.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'admin', toda_id: '', zones: [] }})
  if (cErr) throw cErr
  const userId = created.user!.id

  const { error: upErr } = await sb.from('users_profile').upsert({ user_id: userId, role: 'admin', email })
  if (upErr) throw upErr

  console.log('Seeded admin', userId)
}

main().catch((e) => { console.error(e); process.exit(1) })


