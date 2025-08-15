import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function normalizePhone(input: string): string {
  const digits = String(input).replace(/\D/g, '')
  if (digits.startsWith('63')) return `+${digits}`
  if (digits.startsWith('9')) return `+63${digits}`
  return `+63${digits}`
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-admin-secret')
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { phone, role = 'admin', name, pin } = await request.json()
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 })
    }
    if (!['admin', 'dispatcher', 'guide', 'passenger', 'rider'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)

    // Find profile by phone
    const { data: profile, error: findErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, is_active')
      .eq('phone', normalized)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ success: false, error: findErr.message }, { status: 500 })
    }
    if (!profile) {
      // Optionally auto-create the account as admin (guarded by ADMIN_SECRET)
      const tempPin = String(pin ?? Math.floor(100000 + Math.random() * 900000))
      try {
        // Create auth user with password = PIN
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          phone: normalized,
          password: tempPin,
          phone_confirm: true,
          user_metadata: {
            name: name ?? 'Admin',
            role,
          },
        })
        if (createErr || !created?.user) {
          return NextResponse.json({ success: false, error: createErr?.message || 'Failed to create auth user' }, { status: 500 })
        }

        // Hash PIN for profiles table
        let bcrypt: any
        try { bcrypt = require('bcrypt') } catch {}
        const pinHash = bcrypt ? await bcrypt.hash(tempPin, 12) : ''

        // Upsert profile
        const { error: upsertErr } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: created.user.id,
            phone: normalized,
            name: name ?? 'Admin',
            role,
            pin_hash: pinHash,
            is_active: true,
            metadata: {},
            last_login: null,
          }, { onConflict: 'id' })
        if (upsertErr) {
          return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 })
        }

        // Return created with temp PIN if we generated it
        return NextResponse.json({ success: true, created: true, userId: created.user.id, phone: normalized, role, tempPin: pin ? undefined : tempPin })
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e?.message || 'Failed to auto-create admin' }, { status: 500 })
      }
    }

    // Update profile role and activate
    const { error: updateProfileErr } = await supabaseAdmin
      .from('profiles')
      .update({ role, is_active: true })
      .eq('id', profile.id)

    if (updateProfileErr) {
      return NextResponse.json({ success: false, error: updateProfileErr.message }, { status: 500 })
    }

    // Update Supabase Auth user metadata role (best-effort)
    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        user_metadata: { role },
      })
    } catch (e) {
      // non-fatal
      console.warn('Failed to update auth metadata role:', e)
    }

    return NextResponse.json({ success: true, userId: profile.id, phone: normalized, role })
  } catch (error: any) {
    console.error('Promote admin error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}


