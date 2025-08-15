import { NextRequest, NextResponse } from 'next/server'
import { createUserWithPhoneAndPin } from '@/lib/supabase-auth'

// PRIVILEGED ENDPOINT - Only for creating admin/dispatcher/guide accounts
// In production, this should be protected with admin authentication
export async function POST(request: NextRequest) {
  try {
    const { phone, name, role, pin } = await request.json()

    // Basic validation
    if (!phone || !name || !role || !pin) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Allow all roles for privileged signup
    const allRoles = ['admin', 'dispatcher', 'guide', 'passenger', 'rider'];
    if (!allRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    console.log(`Creating privileged account: ${phone} as ${role}`);

    const result = await createUserWithPhoneAndPin({ phone, name, role, pin })
    
    return NextResponse.json(result, { 
      status: result.success ? 201 : 400 
    })
  } catch (error: any) {
    console.error('Privileged sign up API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}