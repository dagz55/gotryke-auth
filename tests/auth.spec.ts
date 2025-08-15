import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const anon = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_local_dev_key'
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_local_dev_key'

describe('auth flow', () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Passw0rd!'

  it('can create session for admin (seeded)', async () => {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.signInWithPassword({ email: adminEmail, password: adminPassword })
    expect(error).toBeNull()
    expect(data.session?.access_token).toBeTruthy()
  })

  it('sms-hook validates signature', async () => {
    const res401 = await fetch(`${url}/functions/v1/sms-hook`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-hook-signature': 'bad' }, body: JSON.stringify({ phone: '+10000000000', message: 'test' }) })
    expect(res401.status).toBe(401)
  })
})


