
'use client'

import { createSupabaseBrowserClient, type Profile } from '@/lib/supabase-client'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  
  // SMS OTP functions
  sendOTP: (phone: string, purpose?: 'signup' | 'reset') => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>
  
  // Auth functions
  signInWithPin: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>
  signUpWithPin: (data: { phone: string; name: string; role: Profile['role']; pin: string }) => Promise<{ success: boolean; error?: string }>
  // Aliases for components expecting these names
  signIn: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: { phone: string; name: string; role: Profile['role']; pin: string }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  
  // Utility functions
  hasRole: (roles: Profile['role'][]) => boolean
  isAdmin: () => boolean
  isDispatcher: () => boolean
  updatePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // If Supabase client creation failed, set loading to false immediately
  useEffect(() => {
    if (!supabase) {
      console.warn('🚨 Supabase client is null - setting loading to false')
      setLoading(false)
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth state...')
        
        // If no supabase client, skip auth initialization
        if (!supabase) {
          console.warn('🚨 No Supabase client available - skipping auth initialization')
          setLoading(false)
          return
        }
        
        // Add timeout for Supabase operations to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Supabase connection timeout')), 10000)
        })
        
        // Get initial session with timeout
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any
        
        if (session?.user) {
          console.log('🔐 Found existing session for user:', session.user.id)
          setSession(session)
          setUser(session.user)
          
          // Get user profile with timeout
          try {
            const { data: profileData, error: profileError } = await Promise.race([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single(),
              timeoutPromise
            ]) as any
            
            if (profileError) {
              console.error('🔐 Error fetching profile:', profileError)
              // Set loading to false even if profile fetch fails
              setLoading(false)
            } else if (profileData) {
              console.log('🔐 Profile loaded:', profileData.role)
              setProfile(profileData)
              
              // If we have both session and profile, handle initial routing
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                const { getDashboardRoute } = await import('@/lib/role-routes')
                const targetRoute = getDashboardRoute(profileData.role)
                console.log('🔐 Initial redirect to:', targetRoute)
                setTimeout(() => {
                  window.location.href = targetRoute
                }, 100)
              }
            }
          } catch (profileError) {
            console.error('🔐 Profile fetch timeout or error:', profileError)
            // Continue with user session even if profile fails
          }
        } else {
          console.log('🔐 No existing session found')
        }
      } catch (error) {
        console.error('🔐 Auth initialization error:', error)
        // If Supabase is completely unavailable, still set loading to false
        // so users can see the landing page
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'has session' : 'no session')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData)
          
          if (event === 'SIGNED_IN' && profileData) {
            console.log('🔐 SIGNED_IN event - redirecting based on role:', profileData.role)
            
            // Import role routing function
            const { getDashboardRoute } = await import('@/lib/role-routes')
            const targetRoute = getDashboardRoute(profileData.role)
            
            // Use setTimeout to prevent conflicts with auth state changes
            setTimeout(() => {
              window.location.href = targetRoute
            }, 100)
          }
        } else {
          setProfile(null)
          if (event === 'SIGNED_OUT') {
            router.push('/')
          }
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // SMS OTP functions
  const sendOTP = async (phone: string, purpose?: 'signup' | 'reset') => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, purpose }),
      })
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send verification code'
      }
    }
  }

  const verifyOTP = async (phone: string, code: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      })
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to verify code'
      }
    }
  }

  // Auth functions - FIXED VERSION WITHOUT DUPLICATE NAVIGATION
  const signInWithPin = async (phone: string, pin: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin }),
      })
      
      const result = await response.json()
      
      // FIXED: Only return success/error, let auth state change handle navigation
      if (response.ok && result.success) {
        console.log('✅ Sign-in successful - auth state change will handle navigation')
        return { success: true }
      } else {
        console.log('❌ Sign-in failed:', result.error || 'Authentication failed')
        return { 
          success: false, 
          error: result.error || 'Authentication failed' 
        }
      }
      
    } catch (error: any) {
      console.log('❌ Sign-in error:', error.message)
      return {
        success: false,
        error: error.message || 'Sign in failed'
      }
    }
  }

  const signUpWithPin = async (data: { phone: string; name: string; role: Profile['role']; pin: string }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign up failed'
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push('/')
  }

  const updatePin = async (currentPin: string, newPin: string) => {
    try {
      const response = await fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPin, newPin }),
      })
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update PIN'
      }
    }
  }

  // Utility functions
  const hasRole = (roles: Profile['role'][]): boolean => {
    return profile ? roles.includes(profile.role) : false
  }

  const isAdmin = (): boolean => {
    return profile?.role === 'admin'
  }

  const isDispatcher = (): boolean => {
    return profile?.role === 'dispatcher' || profile?.role === 'admin'
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    sendOTP,
    verifyOTP,
    signInWithPin,
    signUpWithPin,
    // component-friendly aliases
    signIn: signInWithPin,
    signUp: signUpWithPin,
    signOut: handleSignOut,
    hasRole,
    isAdmin,
    isDispatcher,
    updatePin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Convenience hooks
export function useUser() {
  const { user, profile, loading } = useAuth()
  return { user, profile, loading }
}

export function useRequireAuth() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/')
    }
  }, [user, profile, loading, router])

  return { user, profile, loading }
}

export function useRequireRole(allowedRoles: Profile['role'][]) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        router.push('/')
      } else if (!allowedRoles.includes(profile.role)) {
        router.push('/dashboard?error=unauthorized')
      }
    }
  }, [user, profile, loading, allowedRoles, router])

  return { user, profile, loading }
}
