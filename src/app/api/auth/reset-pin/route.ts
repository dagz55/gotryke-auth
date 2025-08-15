import { resetUserPinByPhone, sendPhoneVerification, verifyPhoneCode } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/reset-pin
// Step 1: { phone } -> send OTP
// Step 2: { phone, otp, newPin } -> verify and update
export async function POST(request: NextRequest) {
  try {
    const { phone, otp, newPin } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 })
    }

    // STEP 1: Send OTP if only phone is provided
    if (!otp || !newPin) {
      const res = await sendPhoneVerification(phone)
      return NextResponse.json(res, { status: res.success ? 200 : 400 })
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, error: 'Invalid code format' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ success: false, error: 'PIN must be exactly 6 digits' }, { status: 400 })
    }

    // Verify OTP first
    const verify = await verifyPhoneCode(phone, otp)
    if (!verify.success) {
      return NextResponse.json({ success: false, error: verify.error || 'Verification failed' }, { status: 400 })
    }

    // Update PIN
    const result = await resetUserPinByPhone(phone, newPin)
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error: any) {
    console.error('Reset PIN API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


