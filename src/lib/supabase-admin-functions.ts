'use server'

import { supabaseAdmin } from './supabase-admin'
import { Profile } from './supabase-client'

// Extended profile interface for admin functions
export interface AdminUser extends Profile {
  pin?: string // 6-digit PIN for new user creation
  walletBalance?: number
  driversLicense?: {
    number: string
    expiryDate: string
  }
  tricycleRegistration?: {
    plateNumber: string
    expiryDate: string
  }
  isVerified?: boolean
  toda?: string
  bodyNumber?: string
  city?: string
  provider?: string
  status?: string
}

// Settings interface
export interface AppSettings {
  id?: string
  type: string
  data: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Get users by roles for admin panel
export async function getUsers(roles: string[]): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', roles)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    // Map profiles to AdminUser format
    return data.map(profile => ({
      ...profile,
      provider: 'supabase',
      status: profile.is_active ? 'active' : 'inactive',
      // Add default values for missing fields
      walletBalance: 0,
      isVerified: true,
    })) as AdminUser[]
  } catch (error) {
    console.error('Error in getUsers:', error)
    return []
  }
}

// Get users by single role
export async function getUsersByRole(role: string): Promise<AdminUser[]> {
  return getUsers([role])
}

// Create a new user (admin function)
export async function createUser(userData: Partial<AdminUser>): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  try {
    // First create the auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      phone: userData.phone,
      password: userData.pin || '123456', // Default 6-digit PIN, should be changed
      user_metadata: {
        name: userData.name,
        role: userData.role,
      },
      phone_confirm: true
    })

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || 'Failed to create auth user' }
    }

    // Then create the profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        phone: userData.phone!,
        name: userData.name!,
        role: userData.role!,
        pin_hash: userData.pin || '123456', // Default 6-digit PIN, this should be properly hashed
        is_active: true,
        metadata: {
          toda: userData.toda,
          bodyNumber: userData.bodyNumber,
          city: userData.city,
          walletBalance: userData.walletBalance || 0,
          driversLicense: userData.driversLicense,
          tricycleRegistration: userData.tricycleRegistration,
          isVerified: userData.isVerified || false,
        }
      })
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: profileError.message }
    }

    return { 
      success: true, 
      user: {
        ...profile,
        provider: 'supabase',
        status: 'active',
        ...profile.metadata
      } as AdminUser
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create user' }
  }
}

// Update user
export async function updateUser(userId: string, updates: Partial<AdminUser>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        name: updates.name,
        role: updates.role,
        is_active: updates.status === 'active',
        metadata: {
          toda: updates.toda,
          bodyNumber: updates.bodyNumber,
          city: updates.city,
          walletBalance: updates.walletBalance,
          driversLicense: updates.driversLicense,
          tricycleRegistration: updates.tricycleRegistration,
          isVerified: updates.isVerified,
        }
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user' }
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete auth user (this will cascade to profile due to RLS)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authError) {
      return { success: false, error: authError.message }
    }

    // Also delete from profiles table explicitly
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.warn('Profile deletion warning:', profileError.message)
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user' }
  }
}

// Settings management
export async function getSettings(type: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('data')
      .eq('type', type)
      .single()

    if (error) {
      console.log(`No settings found for type: ${type}`)
      return null
    }

    return data?.data || null
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export async function updateSettings(type: string, data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        type,
        data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'type'
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update settings' }
  }
}

// Create app_settings table if it doesn't exist
export async function initializeAppSettings() {
  try {
    // Check if table exists by trying to select from it
    const { error } = await supabaseAdmin
      .from('app_settings')
      .select('id')
      .limit(1)

    if (error && error.message.includes('does not exist')) {
      console.log('app_settings table does not exist. Please create it manually in Supabase.')
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking app_settings table:', error)
    return false
  }
}