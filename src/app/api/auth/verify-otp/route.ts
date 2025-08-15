import { verifyPhoneCode } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone number and code are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    const result = await verifyPhoneCode(phone, code)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
  } catch (error: any) {
    console.error('Verify OTP API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}