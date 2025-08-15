import { createUserWithPhoneAndPin } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, name, role, pin } = await request.json()

    if (!phone || !name || !role || !pin) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'dispatcher', 'guide', 'passenger', 'rider']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    const result = await createUserWithPhoneAndPin({ phone, name, role, pin })
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
  } catch (error: any) {
    console.error('Sign up API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}