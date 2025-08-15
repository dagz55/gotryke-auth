import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import bcrypt from 'bcrypt'

// REPAIR ENDPOINT - Fixes accounts with missing profile records
export async function POST(request: NextRequest) {
  try {
    const { phone, name, role, pin } = await request.json()

    console.log(`Repairing profile for: ${phone}`)

    // Hash PIN
    const saltRounds = 12
    const pinHash = await bcrypt.hash(pin, saltRounds)

    // Create profile record directly
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        phone: phone,
        name: name,
        role: role,
        pin_hash: pinHash,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile repair error:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to create profile record' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile record created' 
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Repair endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}