import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elnntdfdlojxpcjiyehe.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Browser client for client-side operations only
export const createSupabaseBrowserClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('🚨 Missing Supabase environment variables')
      console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
      console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
    }
    
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('🚨 Failed to create Supabase client:', error)
    // Return a mock client to prevent crashes
    return null as any
  }
}

// Database types
export interface Profile {
  id: string
  created_at: string
  updated_at: string
  phone: string
  name: string
  role: 'admin' | 'dispatcher' | 'guide' | 'passenger' | 'rider'
  pin_hash: string
  is_active: boolean
  metadata: Record<string, any>
  last_login: string | null
}

export interface PhoneVerification {
  id: string
  phone: string
  verification_sid: string
  attempts: number
  max_attempts: number
  expires_at: string
  verified: boolean
  created_at: string
}

// Database type definitions for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      phone_verifications: {
        Row: PhoneVerification
        Insert: Omit<PhoneVerification, 'id' | 'created_at'>
        Update: Partial<Omit<PhoneVerification, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'dispatcher' | 'guide' | 'passenger' | 'rider'
    }
  }
}