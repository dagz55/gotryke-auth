'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from './supabase-admin'
import { type Profile } from './supabase-client'
import { createSupabaseServerClient } from './supabase-server'

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID
const twilio = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null
const APP_SECRET_KEY = process.env.APP_SECRET_KEY!

// Import bcrypt for PIN hashing
let bcrypt: any
try {
  bcrypt = require('bcrypt')
} catch (error) {
  console.warn('bcrypt not installed. Please install with: npm install bcrypt @types/bcrypt')
}

// Utility functions
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits and ensure it starts with +63
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('63')) {
    return `+${cleanPhone}`
  }
  if (cleanPhone.startsWith('9')) {
    return `+63${cleanPhone}`
  }
  return `+63${cleanPhone}`
}

const hashPin = async (pin: string): Promise<string> => {
  if (!bcrypt) {
    throw new Error('bcrypt is required for PIN hashing')
  }
  const saltRounds = 12
  return await bcrypt.hash(pin, saltRounds)
}

const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  if (!bcrypt) {
    throw new Error('bcrypt is required for PIN verification')
  }
  return await bcrypt.compare(pin, hash)
}

// SMS OTP Functions
export async function sendPhoneVerification(phone: string): Promise<{
  success: boolean
  verificationSid?: string
  error?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)

    // Validate Twilio configuration
    if (!twilio || !VERIFY_SERVICE_SID) {
      console.error('Twilio Verify not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID')
      return { success: false, error: 'Verification service unavailable. Please contact support.' }
    }
    
    // Check rate limiting
    const recentAttempts = await supabaseAdmin
      .from('phone_verifications')
      .select('*')
      .eq('phone', formattedPhone)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // 15 minutes
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentAttempts.data && recentAttempts.data.length >= 3) {
      return {
        success: false,
        error: 'Too many verification attempts. Please wait 15 minutes before trying again.'
      }
    }
    
    // Send verification via Twilio
    const verification = await twilio.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms'
      })
    
    // Best-effort: store verification record (non-fatal on failure)
    const { error: dbError } = await supabaseAdmin
      .from('phone_verifications')
      .insert({
        phone: formattedPhone,
        verification_sid: verification.sid,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0,
        max_attempts: 5,
        verified: false,
      })
    
    if (dbError) {
      console.warn('Non-fatal: Failed to store verification record:', dbError)
      // Continue; allow user to proceed since Twilio accepted the request
    }
    
    return {
      success: true,
      verificationSid: verification.sid
    }
    
  } catch (error: any) {
    console.error('Send verification error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send verification code'
    }
  }
}

export async function verifyPhoneCode(phone: string, code: string): Promise<{
  success: boolean
  isNewUser?: boolean
  userId?: string
  error?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // Enforce 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return { success: false, error: 'Invalid code format' }
    }
 
    if (!twilio || !VERIFY_SERVICE_SID) {
      return { success: false, error: 'Verification service unavailable' }
    }
 
    // Try to load latest verification record (optional)
    const { data: verificationRecord } = await supabaseAdmin
      .from('phone_verifications')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
 
    // If record exists, enforce simple expiry and attempts policy
    if (verificationRecord) {
      if (new Date() > new Date(verificationRecord.expires_at)) {
        return { success: false, error: 'Verification code has expired. Please request a new code.' }
      }
      if (verificationRecord.attempts >= verificationRecord.max_attempts) {
        return { success: false, error: 'Maximum verification attempts exceeded. Please request a new code.' }
      }
    }
 
    // Verify code with Twilio (authoritative)
    const verificationCheck = await twilio.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code: code
      })
 
    // If we have a DB record, update attempts and verified status (best-effort)
    if (verificationRecord) {
      try {
        await supabaseAdmin
          .from('phone_verifications')
          .update({
            attempts: verificationRecord.attempts + 1,
            verified: verificationCheck.status === 'approved'
          })
          .eq('id', verificationRecord.id)
      } catch (e) {
        console.warn('Non-fatal: failed to update verification record', e)
      }
    }
 
    if (verificationCheck.status !== 'approved') {
      return { success: false, error: 'Invalid verification code. Please try again.' }
    }
 
    // Check if user exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle()
     
    return {
      success: true,
      isNewUser: !existingProfile,
      userId: existingProfile?.id
    }
     
  } catch (error: any) {
    console.error('Verify phone code error:', error)
    return {
      success: false,
      error: error.message || 'Failed to verify code'
    }
  }
}

// Authentication Functions
export async function signInWithPhoneAndPin(phone: string, pin: string): Promise<{
  success: boolean
  user?: any
  session?: any
  profile?: any
  error?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // FIXED: Use Supabase's built-in signInWithPassword for phone authentication
    // Create a server client for authentication
    const supabase = await createSupabaseServerClient()
    
    console.log('🔐 Attempting phone auth with:', { phone: formattedPhone })
    
    // Enforce 6-digit PIN format here as a safeguard
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }

    // Load profile to support fallback password repair and inactive checks
    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, pin_hash, is_active, name, role')
      .eq('phone', formattedPhone)
      .single()

    if (profileError || !profileRow) {
      return { success: false, error: 'User not found or account is inactive' }
    }

    if (!profileRow.is_active) {
      return { success: false, error: 'Account is inactive' }
    }

    // Use Supabase's native phone + password authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password: pin, // PIN acts as the password
    })
    
    if (error) {
      console.warn('⚠️ Supabase auth returned error, attempting fallback repair:', error.message)

      // Fallback: verify PIN against stored hash; if valid, update Supabase Auth password then retry
      const pinMatches = await verifyPin(pin, profileRow.pin_hash)
      if (!pinMatches) {
        return { success: false, error: 'Invalid login credentials' }
      }

      // Update Supabase Auth password to the entered PIN
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(profileRow.id, {
        password: pin,
        phone_confirm: true,
      })
      if (updateErr) {
        console.error('Failed to update Supabase auth password:', updateErr)
        return { success: false, error: 'Authentication repair failed' }
      }

      // Retry sign-in
      const retry = await supabase.auth.signInWithPassword({ phone: formattedPhone, password: pin })
      if (retry.error || !retry.data.user || !retry.data.session) {
        console.error('Retry sign-in failed:', retry.error)
        return { success: false, error: retry.error?.message || 'Authentication failed' }
      }

      return {
        success: true,
        user: retry.data.user,
        session: retry.data.session,
        profile: {
          id: retry.data.user.id,
          phone: retry.data.user.phone,
          name: profileRow.name,
          role: profileRow.role,
          last_login: new Date().toISOString(),
        },
      }
    }
    
    if (!data.user || !data.session) {
      console.error('❌ No user or session in response')
      return {
        success: false,
        error: 'Authentication failed - no session created'
      }
    }
    
    console.log('✅ Authentication successful:', { 
      userId: data.user.id, 
      phone: data.user.phone,
      hasSession: !!data.session
    })
    
    return {
      success: true,
      user: data.user,
      session: data.session,
      profile: {
        id: data.user.id,
        phone: data.user.phone,
        name: profileRow.name ?? data.user.user_metadata?.name,
        role: profileRow.role ?? data.user.user_metadata?.role,
        last_login: new Date().toISOString()
      }
    }
    
  } catch (error: any) {
    console.error('❌ Sign in error:', error)
    return {
      success: false,
      error: error.message || 'Sign in failed'
    }
  }
}

export async function createUserWithPhoneAndPin({
  phone,
  name,
  role,
  pin
}: {
  phone: string
  name: string
  role: Profile['role']
  pin: string
}): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // Enforce 6-digit PIN
    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }
    
    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', formattedPhone)
      .single()
    
    if (existingProfile) {
      return {
        success: false,
        error: 'User already exists with this phone number'
      }
    }
    
    // Ensure phone was verified recently
    try {
      const { data: latestVerification } = await supabaseAdmin
        .from('phone_verifications')
        .select('*')
        .eq('phone', formattedPhone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      // If we have a record, ensure it is not outrageously old (> 30 minutes)
      if (latestVerification) {
        const created = new Date(latestVerification.created_at)
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
        if (created < thirtyMinAgo) {
          return { success: false, error: 'Verification window expired. Please request a new code.' }
        }
      }
      // If no record exists, proceed (Twilio verification already occurred in previous step)
    } catch (e) {
      console.warn('Non-fatal: unable to load verification record, proceeding with signup')
    }
    
    // Hash PIN
    const pinHash = await hashPin(pin)
    
    // Create user with Supabase Admin
    const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      phone: formattedPhone,
      password: pin, // Use PIN as the Supabase password
      user_metadata: {
        name,
        role,
        pin_hash: pinHash
      },
      phone_confirm: true // Skip phone confirmation since we already verified
    })
    
    if (createError || !user) {
      return {
        success: false,
        error: createError?.message || 'Failed to create user'
      }
    }
    
    // Upsert into profiles table (trigger may already have inserted)
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        phone: formattedPhone,
        name,
        role,
        pin_hash: pinHash,
        is_active: true,
        metadata: {},
        last_login: null,
      }, { onConflict: 'id' })
    
    if (profileInsertError) {
      console.error('Failed to insert profile:', profileInsertError)
      return { success: false, error: 'Failed to create profile' }
    }
    
    return {
      success: true,
      user
    }
    
  } catch (error: any) {
    console.error('Create user error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create user'
    }
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getCurrentUser(): Promise<{
  user: any | null
  profile: Profile | null
}> {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { user: null, profile: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { user, profile }
}

export async function requireAuth(): Promise<{
  user: any
  profile: Profile
}> {
  const { user, profile } = await getCurrentUser()
  
  if (!user || !profile) {
    redirect('/')
  }
  
  return { user, profile }
}

export async function requireRole(allowedRoles: Profile['role'][]): Promise<{
  user: any
  profile: Profile
}> {
  const { user, profile } = await requireAuth()
  
  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard?error=unauthorized')
  }
  
  return { user, profile }
}

// Utility function for updating user PIN
export async function updateUserPin(userId: string, currentPin: string, newPin: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Enforce 6-digit PIN
    if (!/^\d{6}$/.test(newPin)) {
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }
    // Get current user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('pin_hash')
      .eq('id', userId)
      .single()
 
    if (!profile) {
      return {
        success: false,
        error: 'User not found'
      }
    }
 
    // Verify current PIN
    const currentPinValid = await verifyPin(currentPin, profile.pin_hash)
    if (!currentPinValid) {
      return {
        success: false,
        error: 'Current PIN is incorrect'
      }
    }
 
    // Hash new PIN
    const newPinHash = await hashPin(newPin)
 
    // Update PIN in database
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ pin_hash: newPinHash })
      .eq('id', userId)
 
    if (updateError) {
      return {
        success: false,
        error: 'Failed to update PIN'
      }
    }

    // Also update Supabase Auth password to keep login aligned
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPin,
    })
    if (authUpdateError) {
      console.error('Failed to update Supabase auth password:', authUpdateError)
    }
 
    return {
      success: true
    }
 
  } catch (error: any) {
    console.error('Update PIN error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update PIN'
    }
  }
}

export async function resetUserPinByPhone(phone: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = formatPhoneNumber(phone)

    if (!/^\d{6}$/.test(newPin)) {
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }

    // Lookup user by phone
    const { data: userProfile, error: findErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', formattedPhone)
      .single()

    if (findErr || !userProfile) {
      return { success: false, error: 'User not found' }
    }

    // Hash and update in profiles
    const newPinHash = await hashPin(newPin)
    const { error: updateDbErr } = await supabaseAdmin
      .from('profiles')
      .update({ pin_hash: newPinHash })
      .eq('id', userProfile.id)

    if (updateDbErr) {
      return { success: false, error: 'Failed to update PIN' }
    }

    // Update Supabase Auth password
    const { error: authUpdateErr } = await supabaseAdmin.auth.admin.updateUserById(userProfile.id, {
      password: newPin,
      phone_confirm: true,
    })

    if (authUpdateErr) {
      console.error('Failed to update Supabase auth password:', authUpdateErr)
      // Still consider partially successful DB update
      return { success: false, error: 'PIN updated in database but failed to update auth password' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Reset PIN by phone error:', error)
    return { success: false, error: error.message || 'Failed to reset PIN' }
  }
}

// Clean up expired verification records (should be run periodically)
export async function cleanupExpiredVerifications(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('phone_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) {
      console.error('Error cleaning up expired verifications:', error)
    }
  } catch (error) {
    console.error('Error cleaning up expired verifications:', error)
  }
}