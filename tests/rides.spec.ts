import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const anon = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_local_dev_key'

describe('rides lifecycle', () => {
  let adminJwt: string
  let dispatcherJwt: string
  let triderJwt: string
  let passengerJwt: string
  let passengerId: string

  beforeAll(async () => {
    const sb = createClient(url, anon)
    const a = await sb.auth.signInWithPassword({ email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! })
    adminJwt = a.data.session!.access_token

    const d = await sb.auth.signInWithPassword({ email: process.env.DISPATCHER_EMAIL!, password: process.env.DISPATCHER_PASSWORD! })
    dispatcherJwt = d.data.session!.access_token

    const t = await sb.auth.signInWithPassword({ email: process.env.TRIDER_EMAIL!, password: process.env.TRIDER_PASSWORD! })
    triderJwt = t.data.session!.access_token

    const p = await sb.auth.signInWithPassword({ email: process.env.PASSENGER1_EMAIL!, password: process.env.PASSENGER1_PASSWORD! })
    passengerJwt = p.data.session!.access_token
    passengerId = p.data.user!.id
  })

  it('request → assign → in_progress → completed; wallet charge + tx rows', async () => {
    const passenger = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${passengerJwt}` }}})
    const { data: ride } = await passenger.from('rides').insert({ passenger_id: passengerId, origin: { o: 1 }, destination: { d: 2 }, fare: 75 }).select('*').single()
    expect(ride).toBeTruthy()

    // assign by dispatcher
    const dispatcher = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${dispatcherJwt}` }}})
    const { data: assigned, error: assignErr } = await dispatcher.from('rides').update({ trider_id: (await createClient(url, anon, { global: { headers: { Authorization: `Bearer ${triderJwt}` }}}).auth.getUser()).data.user!.id, toda_id: 'TODA_A', status: 'assigned' }).eq('id', ride!.id).select('*').single()
    expect(assignErr).toBeNull()

    // trider starts ride
    const trider = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${triderJwt}` }}})
    const { data: inprog } = await trider.from('rides').update({ status: 'in_progress' }).eq('id', ride!.id).select('*').single()
    expect(inprog!.status).toBe('in_progress')

    // complete by trider
    const { data: completed } = await trider.from('rides').update({ status: 'completed' }).eq('id', ride!.id).select('*').single()
    expect(completed!.status).toBe('completed')

    // wallet operations
    const passengerWallet = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${passengerJwt}` }}})
    await passengerWallet.rpc('wallet_cashin', { p_user_id: passengerId, p_amount: 500, p_meta: { test: true }})
    const { data: w } = await passengerWallet.from('wallets').select('*').eq('user_id', passengerId).single()
    expect(Number(w!.balance)).toBeGreaterThanOrEqual(500)

    // charge for the ride
    await passengerWallet.rpc('wallet_charge_for_ride', { p_user_id: passengerId, p_amount: completed!.fare || 50, p_ride_id: ride!.id, p_meta: { reason: 'fare' } })
    const { data: tx } = await passengerWallet.from('transactions').select('*').order('created_at', { ascending: false }).limit(1)
    expect(tx![0].type).toBe('ride_charge')
  })
})


