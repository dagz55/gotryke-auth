import { createSupabaseClient } from '../clients/supabase'

export type Ride = {
  id: string
  passenger_id: string
  trider_id: string | null
  toda_id: string | null
  origin: unknown
  destination: unknown
  status: 'requested'|'assigned'|'in_progress'|'completed'|'canceled'
  fare: number | null
  created_at: string
}

export async function createRide(jwt: string, payload: { origin: unknown; destination: unknown; fare?: number }) {
  const sb = createSupabaseClient(jwt)
  const { data, error } = await sb.from('rides').insert({ ...payload }).select('*').single()
  if (error) throw error
  return data as Ride
}

export async function listMyRides(jwt: string) {
  const sb = createSupabaseClient(jwt)
  const { data, error } = await sb.from('rides').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Ride[]
}


