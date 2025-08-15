#!/usr/bin/env node

/**
 * Create Test Accounts using API endpoints
 * Simulates the actual signup process
 */

require('dotenv').config();

const BASE_URL = 'http://localhost:9002';

// Test account data with simpler structure
const testAccounts = [
  // Passenger accounts
  {
    phone: '9171234567',
    name: 'Maria Santos',
    role: 'passenger',
    pin: '123456'
  },
  {
    phone: '9181234568', 
    name: 'Juan Dela Cruz',
    role: 'passenger',
    pin: '234567'
  },
  {
    phone: '9191234569',
    name: 'Ana Reyes', 
    role: 'passenger',
    pin: '345678'
  },
  
  // Rider accounts
  {
    phone: '9201234570',
    name: 'Pedro Garcia',
    role: 'rider', 
    pin: '456789'
  },
  {
    phone: '9211234571',
    name: 'Roberto Mendoza',
    role: 'rider',
    pin: '567890'
  },
  {
    phone: '9221234572',
    name: 'Carlos Villanueva',
    role: 'rider',
    pin: '678901'
  }
];

async function createAccountViaAPI(account) {
  try {
    console.log(`📝 Creating ${account.role}: ${account.name} (+63${account.phone})`);
    
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: account.phone,
        name: account.name,
        role: account.role,
        pin: account.pin,
        otp: '123456' // Using a dummy OTP for testing
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Success: ${account.name} - Phone: +63${account.phone} - PIN: ${account.pin}`);
      return { success: true, account };
    } else {
      console.log(`❌ Failed: ${account.name} - ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error, account };
    }
    
  } catch (error) {
    console.log(`❌ Error: ${account.name} - ${error.message}`);
    return { success: false, error: error.message, account };
  }
}

async function main() {
  console.log('🔐 Creating Test Accounts via API...\n');
  console.log('⚠️  Note: This may show OTP verification errors, but accounts should still be created.\n');
  
  const results = {
    passengers: [],
    riders: [],
    failed: []
  };
  
  for (const account of testAccounts) {
    const result = await createAccountViaAPI(account);
    
    if (result.success) {
      if (account.role === 'passenger') {
        results.passengers.push(account);
      } else {
        results.riders.push(account);
      }
    } else {
      results.failed.push({ ...account, error: result.error });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print final summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST ACCOUNT CREATION SUMMARY');
  console.log('='.repeat(70));
  
  if (results.passengers.length > 0) {
    console.log(`\n👥 PASSENGER ACCOUNTS (${results.passengers.length}):`);
    results.passengers.forEach(user => {
      console.log(`   📱 +63${user.phone} - ${user.name}`);
      console.log(`      PIN: ${user.pin} (6 digits)`);
    });
  }
  
  if (results.riders.length > 0) {
    console.log(`\n🚗 RIDER ACCOUNTS (${results.riders.length}):`);
    results.riders.forEach(user => {
      console.log(`   📱 +63${user.phone} - ${user.name}`);  
      console.log(`      PIN: ${user.pin} (6 digits)`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ ISSUES (${results.failed.length}):`);
    results.failed.forEach(fail => {
      console.log(`   📱 +63${fail.phone} - ${fail.name}: ${fail.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🧪 MANUAL TEST CREDENTIALS');
  console.log('='.repeat(70));
  console.log('\n🔗 Login URL: http://localhost:9002');
  console.log('\n📋 TEST THESE ACCOUNTS MANUALLY:');
  
  // Show all accounts for manual testing regardless of API success
  testAccounts.forEach(account => {
    console.log(`\n${account.role.toUpperCase()}: ${account.name}`);
    console.log(`   Phone: ${account.phone} (enter without +63)`);
    console.log(`   PIN: ${account.pin}`);
  });
  
  console.log('\n✅ Use these credentials to test login functionality!');
}

main().catch(console.error);