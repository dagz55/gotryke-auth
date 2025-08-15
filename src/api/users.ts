import { createClient } from '@supabase/supabase-js'

export async function signUp(email: string, password: string) {
  const url = process.env.SUPABASE_URL as string
  const anon = process.env.SUPABASE_ANON_KEY as string
  const sb = createClient(url, anon)
  const { data, error } = await sb.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const url = process.env.SUPABASE_URL as string
  const anon = process.env.SUPABASE_ANON_KEY as string
  const sb = createClient(url, anon)
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}


