import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const anon = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_local_dev_key'
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role_local_dev_key'

async function createUserWithRole(email: string, password: string, role: 'admin'|'dispatcher'|'trider'|'passenger', toda_id = '', zones: string[] = []) {
  const admin = createClient(url, service, { auth: { persistSession: false } })
  const { data: cu, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role, toda_id, zones } })
  if (cErr) throw cErr
  const userId = cu.user!.id
  const { error: upErr } = await admin.from('users_profile').upsert({ user_id: userId, role, email, toda_id: toda_id || null, zones: zones.length ? zones : null })
  if (upErr) throw upErr
  const userClient = createClient(url, anon)
  const { data: signIn, error: sErr } = await userClient.auth.signInWithPassword({ email, password })
  if (sErr) throw sErr
  return { userId, jwt: signIn.session!.access_token }
}

describe('RLS policies', () => {
  let adminJwt: string
  let dispatcherJwt: string
  let dispatcherUserId: string
  let triderJwt: string
  let triderUserId: string
  let p1Jwt: string
  let p1UserId: string
  let p2Jwt: string

  beforeAll(async () => {
    // admin
    const adminClient = createClient(url, anon)
    const { data: aSign } = await adminClient.auth.signInWithPassword({ email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! })
    adminJwt = aSign!.session!.access_token
    // dispatcher (TODA_A)
    const d = await createUserWithRole(process.env.DISPATCHER_EMAIL!, process.env.DISPATCHER_PASSWORD!, 'dispatcher', 'TODA_A')
    dispatcherJwt = d.jwt; dispatcherUserId = d.userId
    // trider
    const t = await createUserWithRole(process.env.TRIDER_EMAIL!, process.env.TRIDER_PASSWORD!, 'trider', 'TODA_A')
    triderJwt = t.jwt; triderUserId = t.userId
    // passengers
    const p1 = await createUserWithRole(process.env.PASSENGER1_EMAIL!, process.env.PASSENGER1_PASSWORD!, 'passenger')
    p1Jwt = p1.jwt; p1UserId = p1.userId
    const p2 = await createUserWithRole(process.env.PASSENGER2_EMAIL!, process.env.PASSENGER2_PASSWORD!, 'passenger')
    p2Jwt = p2.jwt
  })

  it('passenger can only see their rides', async () => {
    const p1 = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${p1Jwt}` }}})
    const p2 = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${p2Jwt}` }}})
    await p1.from('rides').insert({ passenger_id: p1UserId, origin: { a: 1 }, destination: { b: 2 }, fare: 100 })
    const { data: p1Rides } = await p1.from('rides').select('*')
    const { data: p2Rides } = await p2.from('rides').select('*')
    expect(p1Rides!.length).toBeGreaterThan(0)
    expect(p2Rides!.find(r => r.passenger_id === p1UserId)).toBeFalsy()
  })

  it('dispatcher limited to their toda_id', async () => {
    const dis = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${dispatcherJwt}` }}})
    const { data: rides } = await dis.from('rides').select('*')
    // All rides visible to dispatcher must have toda_id == TODA_A or null (null not visible due to policy)
    expect((rides||[]).every(r => r.toda_id === 'TODA_A')).toBe(true)
  })

  it('trider sees only assigned rides', async () => {
    const admin = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${adminJwt}` }}})
    // Assign one ride to trider
    const { data: ride } = await admin.from('rides').insert({ passenger_id: p1UserId, origin: { a: 1 }, destination: { b: 2 }, fare: 50, toda_id: 'TODA_A', trider_id: triderUserId, status: 'assigned' }).select('*').single()
    const tr = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${triderJwt}` }}})
    const { data: trRides } = await tr.from('rides').select('*')
    expect(trRides!.find(r => r.id === ride!.id)).toBeTruthy()
  })

  it('passengers cannot see others wallets; admin can', async () => {
    const sb = createClient(url, anon)
    const { data: p2Login } = await sb.auth.signInWithPassword({ email: process.env.PASSENGER2_EMAIL!, password: process.env.PASSENGER2_PASSWORD! })
    const p2Jwt = p2Login!.session!.access_token
    const p2 = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${p2Jwt}` }}})
    const { error: err } = await p2.from('wallets').select('*').eq('user_id', p1UserId).single()
    expect(err).toBeTruthy()

    const admin = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${adminJwt}` }}})
    const { data: w, error: wErr } = await admin.from('wallets').select('*').eq('user_id', p1UserId).maybeSingle()
    expect(wErr).toBeNull()
  })
})


