import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseClient(jwt?: string): SupabaseClient {
  const url = process.env.SUPABASE_URL as string
  const anon = process.env.SUPABASE_ANON_KEY as string
  return createClient(url, anon, {
    global: jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined,
    auth: { persistSession: false }
  })
}


