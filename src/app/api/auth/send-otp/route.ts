import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPhoneVerification } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, purpose } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Purpose-aware pre-checks to save SMS cost
    const digits = String(phone).replace(/\D/g, '')
    const normalized = digits.startsWith('63') ? `+${digits}` : (digits.startsWith('9') ? `+63${digits}` : `+63${digits}`)

    if (purpose === 'signup') {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', normalized)
        .maybeSingle()
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account already exists with this phone number.' },
          { status: 400 }
        )
      }
    }

    if (purpose === 'reset') {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', normalized)
        .maybeSingle()
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'No account found with this phone number.' },
          { status: 400 }
        )
      }
    }

    const result = await sendPhoneVerification(phone)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
  } catch (error: any) {
    console.error('Send OTP API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}