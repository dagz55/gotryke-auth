import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name && !email) {
      return NextResponse.json(
        { success: false, error: 'At least one field (name or email) is required' },
        { status: 400 }
      )
    }

    // Get current user from session
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name) {
      updateData.name = name.trim()
    }

    // Update profile in database
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Update auth user email if provided
    if (email && email !== user.email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email: email.trim() }
      )

      if (emailError) {
        console.error('Email update error:', emailError)
        return NextResponse.json(
          { success: false, error: 'Profile updated but failed to update email' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}