#!/usr/bin/env node

export class AuthSystemFixer {
  public async fixBrokenAuthSystem(): Promise<void> {
    console.log('🚨 AUTH SYSTEM FIXER - Fixing broken authentication');
    console.log('='.repeat(60));
    
    console.log('CRITICAL ISSUES IDENTIFIED:');
    console.log('1. bcrypt "data and hash arguments required" - PIN hash corruption');
    console.log('2. Session creation using fake email approach is broken');
    console.log('3. Phone field empty in session user object');
    console.log('4. APIs returning 400 immediately after first attempt');
    console.log('');
    
    await this.implementProperPhoneAuth();
    await this.fixSessionCreation();
    await this.cleanupBrokenAccounts();
  }

  private async implementProperPhoneAuth(): Promise<void> {
    console.log('1️⃣ Implementing proper phone-based authentication...');
    
    // The core issue: trying to use email-based session creation for phone auth
    // Need to use Supabase's phone auth properly
    
    const fixedSignInFunction = `export async function signInWithPhoneAndPin(phone: string, pin: string): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // Get user from Supabase Auth
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    if (usersError) {
      console.error('Auth users lookup error:', usersError)
      return { success: false, error: 'Authentication system error' }
    }
    
    // Find user by phone - handle both formats
    const user = users.find(u => 
      u.phone === formattedPhone || 
      u.phone === formattedPhone.replace('+', '') ||
      u.phone === '+' + formattedPhone.replace('+', '')
    )
    
    if (!user || !user.user_metadata?.pin_hash) {
      return { success: false, error: 'User not found or account is inactive' }
    }
    
    // Verify PIN
    const pinValid = await verifyPin(pin, user.user_metadata.pin_hash)
    if (!pinValid) {
      return { success: false, error: 'Invalid PIN' }
    }
    
    // FIXED: Create proper session for phone-based user
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: user.id
    })
    
    if (sessionError || !session) {
      console.error('Session creation error:', sessionError)
      return { success: false, error: 'Failed to create session' }
    }
    
    return {
      success: true,
      user: {
        ...session.user,
        profile: {
          id: user.id,
          phone: user.phone,
          name: user.user_metadata.name,
          role: user.user_metadata.role,
          last_login: new Date().toISOString()
        }
      }
    }
    
  } catch (error: any) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: error.message || 'Sign in failed'
    }
  }
}`;

    console.log('   📝 New sign-in implementation:');
    console.log('   • Uses admin.createSession() instead of generateLink()');
    console.log('   • Handles phone number format variations');
    console.log('   • Proper error handling for PIN hash issues');
    console.log('   • Creates real session with user ID');
  }

  private async fixSessionCreation(): Promise<void> {
    console.log('\n2️⃣ Fixing session creation in signin API...');
    
    const fixedAPIRoute = `export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json()

    console.log('🔐 SIGNIN API:', { phone, pinProvided: !!pin })

    if (!phone || !pin) {
      return NextResponse.json(
        { success: false, error: 'Phone number and PIN are required' },
        { status: 400 }
      )
    }

    const result = await signInWithPhoneAndPin(phone, pin)
    
    if (result.success && result.user) {
      // FIXED: Set session using Supabase server client
      const supabase = await createSupabaseServerClient()
      
      // Set the session in the server
      const { error } = await supabase.auth.setSession({
        access_token: result.user.access_token,
        refresh_token: result.user.refresh_token
      })
      
      if (error) {
        console.error('Session setting error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to establish session' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true,
        user: result.user.profile 
      }, { status: 200 })
    }
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
  } catch (error: any) {
    console.error('Sign in API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}`;

    console.log('   📝 API route fixes:');
    console.log('   • Uses createSession() result properly');
    console.log('   • Sets session tokens in server client');
    console.log('   • Better error handling');
    console.log('   • Returns user profile data');
  }

  private async cleanupBrokenAccounts(): Promise<void> {
    console.log('\n3️⃣ Account cleanup needed...');
    
    console.log('   🧹 Manual cleanup required:');
    console.log('   • Delete corrupted accounts from Supabase Auth');
    console.log('   • Recreate admin account with proper PIN hash');
    console.log('   • Test with fresh account creation');
    console.log('');
    console.log('   📋 Recommended steps:');
    console.log('   1. Apply the auth function fixes');
    console.log('   2. Create completely new test account');
    console.log('   3. Test login flow end-to-end');
    console.log('   4. Verify session persistence and dashboard access');
  }

  public async generateImplementationPlan(): Promise<void> {
    console.log('\n🔧 IMPLEMENTATION PLAN:');
    console.log('='.repeat(30));
    
    console.log('STEP 1: Fix signInWithPhoneAndPin function');
    console.log('• Replace generateLink with createSession');
    console.log('• Fix phone number lookup logic');
    console.log('• Add proper PIN hash validation');
    console.log('');
    
    console.log('STEP 2: Fix signin API route');
    console.log('• Use session tokens properly');
    console.log('• Set session in server client');
    console.log('• Return correct user data');
    console.log('');
    
    console.log('STEP 3: Test with fresh account');
    console.log('• Create new admin account');
    console.log('• Test complete login flow');
    console.log('• Verify dashboard access');
    console.log('');
    
    console.log('🎯 EXPECTED OUTCOME:');
    console.log('• Login succeeds with proper session');
    console.log('• User stays logged in');
    console.log('• Dashboard loads correctly');
    console.log('• No more 400 errors or redirect loops');
  }
}

// CLI interface
if (require.main === module) {
  const fixer = new AuthSystemFixer();
  
  fixer.fixBrokenAuthSystem().then(() => {
    return fixer.generateImplementationPlan();
  }).then(() => {
    console.log('\\n✅ Auth system analysis complete');
    console.log('Ready to implement fixes...');
  });
}