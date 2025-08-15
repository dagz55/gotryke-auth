import { signInWithPhoneAndPin } from '@/lib/supabase-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json()

    if (!phone || !pin) {
      return NextResponse.json(
        { success: false, error: 'Phone number and PIN are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    console.log('🔐 API: Attempting sign-in for phone:', phone)
    const result = await signInWithPhoneAndPin(phone, pin)
    
    if (result.success && result.user && result.session) {
      console.log('🔐 API: Sign-in successful, creating server client for session handling')
      
      // Create server client to handle cookies properly
      const supabase = await createSupabaseServerClient()
      
      // Set the session on the server client to sync cookies
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token
      })
      
      console.log('✅ API: Session set, returning success')
      return NextResponse.json({ 
        success: true,
        user: result.user,
        profile: result.profile 
      }, { status: 200 })
    }
    
    console.log('❌ API: Sign-in failed:', result.error)
    return NextResponse.json(result, { 
      status: result.error?.toLowerCase().includes('not found') || result.error?.toLowerCase().includes('inactive') ? 404 : 400
    })
  } catch (error: any) {
    console.error('❌ Sign in API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}