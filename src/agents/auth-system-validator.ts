#!/usr/bin/env node

export class AuthSystemValidator {
  public async validateAuthSystem(): Promise<void> {
    console.log('🔐 AUTH SYSTEM VALIDATOR - Testing complete auth flow');
    console.log('='.repeat(60));
    
    await this.testCompleteFlow();
  }

  private async testCompleteFlow(): void {
    console.log('🧪 Testing complete auth flow with debugging...');
    
    const testPhone = '+639876543210';
    const testData = {
      phone: testPhone,
      name: 'Debug Test User',
      role: 'passenger',
      pin: '1234'
    };

    // Step 1: Create account
    console.log(`\n1️⃣ Creating account for ${testPhone}...`);
    try {
      const signupResponse = await fetch('http://localhost:9002/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const signupResult = await signupResponse.json();
      console.log('   📊 Signup result:', JSON.stringify(signupResult, null, 2));
      
      if (!signupResult.success) {
        console.log('   ❌ Signup failed, stopping test');
        return;
      }
      
      console.log('   ✅ Account created successfully');
      
    } catch (error: any) {
      console.log(`   ❌ Signup error: ${error.message}`);
      return;
    }

    // Step 2: Attempt login
    console.log(`\n2️⃣ Attempting login for ${testPhone}...`);
    try {
      const signinResponse = await fetch('http://localhost:9002/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          pin: testData.pin
        })
      });

      const signinResult = await signinResponse.json();
      console.log('   📊 Signin result:', JSON.stringify(signinResult, null, 2));
      
      if (signinResult.success) {
        console.log('   ✅ Login successful - auth system is working!');
      } else {
        console.log(`   ❌ Login failed: ${signinResult.error}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Signin error: ${error.message}`);
    }

    // Step 3: Test with different phone formats
    console.log(`\n3️⃣ Testing different phone formats for login...`);
    const phoneVariants = [
      testPhone,
      testPhone.replace('+', ''),
      testPhone.replace('+63', '9')
    ];

    for (const phoneVariant of phoneVariants) {
      try {
        console.log(`   🔄 Trying phone format: ${phoneVariant}`);
        
        const response = await fetch('http://localhost:9002/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneVariant,
            pin: testData.pin
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`      ✅ SUCCESS with format: ${phoneVariant}`);
        } else {
          console.log(`      ❌ FAILED with format: ${phoneVariant} - ${result.error}`);
        }
        
      } catch (error: any) {
        console.log(`      ❌ ERROR with format: ${phoneVariant} - ${error.message}`);
      }
    }

    console.log('\n📋 ANALYSIS:');
    console.log('If no phone formats work for login, the issue is in:');
    console.log('• Phone storage format vs search format mismatch');
    console.log('• Supabase Auth API behavior');
    console.log('• Authentication function logic');
  }
}

// CLI interface
if (require.main === module) {
  const validator = new AuthSystemValidator();
  validator.validateAuthSystem();
}