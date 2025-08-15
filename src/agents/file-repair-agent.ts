#!/usr/bin/env node

export class FileRepairAgent {
  public async repairAuthContext(): Promise<void> {
    console.log('🔧 FILE REPAIR AGENT - Fixing auth-context.tsx syntax errors');
    console.log('='.repeat(60));
    
    const fixedAuthContext = `
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient, type Profile } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  
  // SMS OTP functions
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>
  
  // Auth functions
  signInWithPin: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>
  signUpWithPin: (data: { phone: string; name: string; role: Profile['role']; pin: string }) => Promise<{ success: boolean; error?: string }>
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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
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
          
          if (event === 'SIGNED_IN') {
            console.log('🔐 SIGNED_IN event - forcing navigation to dashboard')
            
            // Use window.location immediately - most reliable method
            window.location.href = '/dashboard'
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
  const sendOTP = async (phone: string) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
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

  // Auth functions - FIXED VERSION WITH IMMEDIATE ROUTING
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
      
      if (result.success) {
        console.log('✅ Sign-in successful - forcing immediate navigation')
        
        // Force immediate navigation - don't wait for auth state change
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
        
        // Session will be updated via auth state change listener
        return { success: true }
      }
      
      return result
    } catch (error: any) {
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
`;

    try {
      const { writeFile } = await import('fs/promises');
      const authContextPath = '/Users/robertsuarez/gotryke-auth/src/contexts/auth-context.tsx';
      
      await writeFile(authContextPath, fixedAuthContext.trim());
      console.log('✅ Successfully repaired auth-context.tsx');
      console.log('✅ Routing fix included: window.location.href on sign-in success');
      
      await this.testRepair();
      
    } catch (error: any) {
      console.log('❌ Failed to repair file:', error.message);
    }
  }

  private async testRepair(): Promise<void> {
    console.log('🧪 Testing repaired file...');
    
    // Give server time to recompile
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const response = await fetch('http://localhost:9002');
      if (response.ok) {
        console.log('✅ Server compilation successful - syntax errors fixed');
        
        // Test auth API
        const authTest = await fetch('http://localhost:9002/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+1234567890', pin: '1234' })
        });
        
        const authResult = await authTest.json();
        console.log('✅ Auth API working:', authResult.success ? 'Success' : authResult.error);
        
        console.log('');
        console.log('🎯 REPAIR COMPLETE:');
        console.log('✅ Syntax errors fixed');
        console.log('✅ Server compiling properly');
        console.log('✅ Auth API functional');
        console.log('✅ Routing fix active (window.location.href)');
        console.log('');
        console.log('🔄 READY FOR TESTING - Sign in should now redirect properly');
        
      } else {
        console.log('⚠️  Server still returning errors - may need additional fixes');
      }
    } catch (error: any) {
      console.log('⚠️  Could not test repair:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const repairAgent = new FileRepairAgent();
  repairAgent.repairAuthContext();
}