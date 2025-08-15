#!/usr/bin/env node

export class DatabaseDebugAgent {
  public async debugUserCreation(): Promise<void> {
    console.log('🔍 DATABASE DEBUG AGENT - Investigating user creation issue');
    console.log('='.repeat(60));
    
    console.log('ISSUE: Account creation succeeds but login fails');
    console.log('ERROR: "User not found or account is inactive"');
    console.log('');
    
    await this.analyzeAuthFlow();
    await this.testDirectDatabaseCreation();
  }

  private async analyzeAuthFlow(): Promise<void> {
    console.log('1️⃣ Analyzing authentication flow...');
    console.log('   📋 Current flow analysis:');
    console.log('   • createUserWithPhoneAndPin: Creates user in Supabase Auth');
    console.log('   • User metadata stored: name, role, pin_hash');
    console.log('   • signInWithPhoneAndPin: Looks for user in profiles table');
    console.log('   • 🚨 MISMATCH: User created in auth, but login checks profiles');
    console.log('');
    
    console.log('   🔧 The problem:');
    console.log('   • Signup creates user in auth.users');
    console.log('   • Login checks profiles table');
    console.log('   • Missing: Profile table population after user creation');
  }

  private async testDirectDatabaseCreation(): Promise<void> {
    console.log('\n2️⃣ Testing direct profile creation...');
    
    // Let's try to fix this by creating the profile record directly
    const testUser = {
      phone: '+639171841002',
      name: 'Admin User',
      role: 'admin',
      pin: '1234'
    };

    console.log('   🔧 Creating profile record for authentication...');
    
    try {
      // We need to create the profile entry that the signin function expects
      const profileData = {
        phone: testUser.phone,
        name: testUser.name,
        role: testUser.role,
        pin_hash: 'temp_hash', // We'll need to hash the PIN properly
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('   📊 Profile data to create:', JSON.stringify(profileData, null, 2));
      console.log('   ⚠️  Cannot directly create database records from here');
      console.log('   ⚠️  Need to fix the createUserWithPhoneAndPin function');

    } catch (error: any) {
      console.log(`   ❌ Profile creation failed: ${error.message}`);
    }
  }

  public async generateFixPlan(): Promise<void> {
    console.log('\n🔧 FIX PLAN:');
    console.log('='.repeat(20));
    
    console.log('PROBLEM: User creation and authentication use different data sources');
    console.log('');
    console.log('CURRENT FLOW:');
    console.log('1. createUserWithPhoneAndPin() → Creates user in auth.users');
    console.log('2. signInWithPhoneAndPin() → Looks for user in profiles table');
    console.log('3. ❌ No profile record exists → "User not found"');
    console.log('');
    console.log('SOLUTION:');
    console.log('1. Fix createUserWithPhoneAndPin to also create profile record');
    console.log('2. OR fix signInWithPhoneAndPin to use auth.users data');
    console.log('3. Ensure consistent data between auth.users and profiles table');
    console.log('');
    console.log('RECOMMENDED FIX:');
    console.log('Update createUserWithPhoneAndPin to create both:');
    console.log('• Supabase auth user');
    console.log('• Corresponding profiles table entry');
  }
}

// CLI interface
if (require.main === module) {
  const debugAgent = new DatabaseDebugAgent();
  
  debugAgent.debugUserCreation().then(() => {
    return debugAgent.generateFixPlan();
  }).then(() => {
    console.log('\n✅ Database debug analysis complete');
  });
}