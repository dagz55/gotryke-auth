
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Used for server-side rendering and API routes
export const supabaseServer = () => {
    return createClient(supabaseUrl, supabaseAnonKey)
}

// Used for client-side authentication
export const supabaseBrowser = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

