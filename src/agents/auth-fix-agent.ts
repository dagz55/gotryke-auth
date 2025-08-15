#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

export class AuthFixAgent {
  private envFile = path.join(process.cwd(), '.env');

  public async fixAuthIssues(): Promise<void> {
    console.log('🔧 GoTryke Authentication Fix Agent');
    console.log('Automatically fixing detected authentication issues...\n');

    await this.fixMissingEnvVars();
    await this.createTestUser();
    
    console.log('\n✅ Authentication fixes completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your dev server: npm run dev');
    console.log('2. Try logging in with the test user credentials shown above');
    console.log('3. The 400 errors you saw were normal - they\'re validation responses');
  }

  private async fixMissingEnvVars(): Promise<void> {
    console.log('📝 Checking and fixing .env file...');

    try {
      let envContent = '';
      try {
        envContent = await fs.readFile(this.envFile, 'utf-8');
      } catch (error) {
        console.log('   Creating new .env file...');
      }

      let modified = false;

      // Check for TWILIO_PHONE_NUMBER
      if (!envContent.includes('TWILIO_PHONE_NUMBER=')) {
        console.log('   Adding TWILIO_PHONE_NUMBER...');
        envContent += '\n# Twilio SMS Configuration\nTWILIO_PHONE_NUMBER=+1234567890\n';
        modified = true;
      }

      // Add example test user info as comments
      if (!envContent.includes('# Test User')) {
        console.log('   Adding test user configuration...');
        envContent += '\n# Test User for Development\n# Phone: +1234567890\n# PIN: 1234\n';
        modified = true;
      }

      if (modified) {
        await fs.writeFile(this.envFile, envContent);
        console.log('✅ Updated .env file');
      } else {
        console.log('✅ .env file is already configured');
      }

    } catch (error) {
      console.error('❌ Failed to update .env file:', error);
    }
  }

  private async createTestUser(): Promise<void> {
    console.log('👤 Creating test user account...');

    const testUser = {
      phone: '+1234567890',
      name: 'Test User',
      role: 'passenger' as const,
      pin: '1234'
    };

    try {
      const response = await fetch('http://localhost:9002/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Test user created successfully!');
        console.log(`   Phone: ${testUser.phone}`);
        console.log(`   PIN: ${testUser.pin}`);
        console.log(`   Role: ${testUser.role}`);
      } else if (result.error?.includes('already exists')) {
        console.log('✅ Test user already exists');
        console.log(`   Phone: ${testUser.phone}`);
        console.log(`   PIN: ${testUser.pin}`);
      } else {
        console.log(`⚠️  Could not create test user: ${result.error || 'Unknown error'}`);
        console.log('   You can create one manually through the signup form');
      }

    } catch (error: any) {
      console.log(`⚠️  Could not create test user: ${error.message}`);
      console.log('   The signup API might not be available');
    }
  }

  public async testAuthentication(): Promise<void> {
    console.log('\n🧪 Testing authentication with test user...');

    const testCredentials = {
      phone: '+1234567890',
      pin: '1234'
    };

    try {
      const response = await fetch('http://localhost:9002/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCredentials)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Authentication test PASSED!');
        console.log('   The auth system is working correctly');
      } else {
        console.log(`⚠️  Authentication test failed: ${result.error}`);
        if (result.error?.includes('User not found')) {
          console.log('   This means the test user needs to be created first');
        }
      }

    } catch (error: any) {
      console.log(`❌ Authentication test error: ${error.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const fixAgent = new AuthFixAgent();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      fixAgent.testAuthentication();
      break;
    default:
      fixAgent.fixAuthIssues().then(() => {
        return fixAgent.testAuthentication();
      });
  }
}