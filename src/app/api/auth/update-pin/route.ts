import { NextRequest, NextResponse } from 'next/server'
import { updateUserPin, getCurrentUser } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { currentPin, newPin } = await request.json()

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { success: false, error: 'Current PIN and new PIN are required' },
        { status: 400 }
      )
    }

    // Validate new PIN
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Get current user
    const { user } = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await updateUserPin(user.id, currentPin, newPin)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
  } catch (error: any) {
    console.error('Update PIN API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}