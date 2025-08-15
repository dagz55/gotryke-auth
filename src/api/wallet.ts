import { createSupabaseClient } from '../clients/supabase'

export async function getWallet(jwt: string) {
  const sb = createSupabaseClient(jwt)
  const { data, error } = await sb.from('wallets').select('*').maybeSingle()
  if (error) throw error
  return data
}


