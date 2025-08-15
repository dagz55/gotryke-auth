#!/usr/bin/env node

export class MultiRoleAccountCreator {
  private readonly phone = '+639171841002';
  private readonly pin = '1234';
  private readonly name = 'Admin User';

  public async createAllRoleAccounts(): Promise<void> {
    console.log('🔐 MULTI-ROLE ACCOUNT CREATOR');
    console.log('='.repeat(40));
    console.log(`Creating accounts for: ${this.phone}`);
    console.log(`Default PIN: ${this.pin}`);
    console.log('');

    const roles = ['admin', 'dispatcher', 'guide', 'passenger', 'rider'];
    
    for (const role of roles) {
      await this.createRoleAccount(role);
    }

    await this.testMultiRoleLogin();
  }

  private async createRoleAccount(role: string): Promise<void> {
    console.log(`🔄 Creating ${role} account...`);
    
    try {
      // Use privileged endpoint for all roles
      const response = await fetch('http://localhost:9002/api/auth/signup-privileged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: this.phone,
          name: `${this.name} (${role.charAt(0).toUpperCase() + role.slice(1)})`,
          role: role,
          pin: this.pin
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ ${role} account created successfully`);
      } else if (result.error && result.error.includes('already registered')) {
        console.log(`   ✅ ${role} account already exists`);
      } else {
        console.log(`   ⚠️  ${role} account creation failed: ${result.error}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Error creating ${role} account: ${error.message}`);
    }
  }

  private async testMultiRoleLogin(): Promise<void> {
    console.log('\n🧪 Testing multi-role login capability...');
    
    try {
      const response = await fetch('http://localhost:9002/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: this.phone,
          pin: this.pin
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('   ✅ Multi-role account can sign in successfully');
      } else if (result.error && result.error.includes('User not found')) {
        console.log('   ⚠️  Account exists but may need activation');
      } else {
        console.log(`   ❌ Login test failed: ${result.error}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Login test error: ${error.message}`);
    }

    console.log('\n📋 MULTI-ROLE ACCOUNT SUMMARY:');
    console.log('=' .repeat(35));
    console.log(`Phone: ${this.phone}`);
    console.log(`PIN: ${this.pin}`);
    console.log('Roles: admin, dispatcher, guide, passenger, rider');
    console.log('');
    console.log('🔄 USAGE:');
    console.log('1. Sign in with the same credentials');
    console.log('2. System will authenticate based on available account');
    console.log('3. To switch roles, sign out and sign in again');
    console.log('4. Each role has separate profile and permissions');
  }
}

// CLI interface
if (require.main === module) {
  const creator = new MultiRoleAccountCreator();
  
  creator.createAllRoleAccounts().then(() => {
    console.log('\n✅ Multi-role account creation complete');
  }).catch(error => {
    console.error('❌ Failed to create multi-role accounts:', error);
    process.exit(1);
  });
}