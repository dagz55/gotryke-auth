#!/usr/bin/env node

/**
 * Create Test Accounts for GoTryke v2.2.0
 * Creates dummy passenger and rider accounts for testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test account data
const testAccounts = [
  // Passenger accounts
  {
    phone: '9171234567',
    name: 'Maria Santos',
    role: 'passenger',
    pin: '123456',
    city: 'Manila',
    metadata: {
      preferredPayment: 'cash',
      emergencyContact: '9181234567'
    }
  },
  {
    phone: '9181234568',
    name: 'Juan Dela Cruz',
    role: 'passenger', 
    pin: '234567',
    city: 'Quezon City',
    metadata: {
      preferredPayment: 'gcash',
      emergencyContact: '9171234568'
    }
  },
  {
    phone: '9191234569',
    name: 'Ana Reyes',
    role: 'passenger',
    pin: '345678',
    city: 'Makati',
    metadata: {
      preferredPayment: 'card',
      emergencyContact: '9201234569'
    }
  },
  
  // Rider accounts
  {
    phone: '9201234570',
    name: 'Pedro Garcia',
    role: 'rider',
    pin: '456789',
    city: 'Manila',
    toda: 'TODA-001',
    bodyNumber: 'T-001',
    metadata: {
      driversLicense: {
        number: 'N02-12-123456',
        expiryDate: '2026-12-31'
      },
      tricycleRegistration: {
        plateNumber: 'ABC-123',
        expiryDate: '2026-06-30'
      },
      bankAccount: '123456789',
      isVerified: true,
      walletBalance: 150.00
    }
  },
  {
    phone: '9211234571',
    name: 'Roberto Mendoza',
    role: 'rider',
    pin: '567890',
    city: 'Quezon City',
    toda: 'TODA-002', 
    bodyNumber: 'T-002',
    metadata: {
      driversLicense: {
        number: 'N02-13-234567',
        expiryDate: '2027-03-15'
      },
      tricycleRegistration: {
        plateNumber: 'XYZ-456',
        expiryDate: '2026-09-30'
      },
      bankAccount: '234567890',
      isVerified: true,
      walletBalance: 275.50
    }
  },
  {
    phone: '9221234572',
    name: 'Carlos Villanueva',
    role: 'rider',
    pin: '678901',
    city: 'Pasig',
    toda: 'TODA-003',
    bodyNumber: 'T-003',
    metadata: {
      driversLicense: {
        number: 'N02-14-345678',
        expiryDate: '2025-11-20'
      },
      tricycleRegistration: {
        plateNumber: 'DEF-789',
        expiryDate: '2025-12-31'
      },
      bankAccount: '345678901',
      isVerified: false, // Pending verification
      walletBalance: 89.25
    }
  }
];

async function createTestAccount(accountData) {
  try {
    console.log(`Creating account for ${accountData.name} (${accountData.role})...`);
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: `+63${accountData.phone}`,
      password: accountData.pin,
      user_metadata: {
        name: accountData.name,
        role: accountData.role,
      },
      phone_confirm: true
    });

    if (authError) {
      console.error(`❌ Auth creation failed for ${accountData.name}:`, authError.message);
      return { success: false, error: authError.message };
    }

    // Create profile (matching actual database schema)
    const profileData = {
      id: authUser.user.id,
      phone: accountData.phone,
      name: accountData.name,
      role: accountData.role,
      pin_hash: accountData.pin, // In production, this should be properly hashed
      is_active: true,
      metadata: {
        // Store additional data in metadata field
        city: accountData.city,
        toda: accountData.toda,
        bodyNumber: accountData.bodyNumber,
        ...accountData.metadata
      },
      last_login: null
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      console.error(`❌ Profile creation failed for ${accountData.name}:`, profileError.message);
      return { success: false, error: profileError.message };
    }

    console.log(`✅ Created: ${accountData.name} (+63${accountData.phone}) - PIN: ${accountData.pin}`);
    return { 
      success: true, 
      user: {
        id: authUser.user.id,
        phone: accountData.phone,
        name: accountData.name,
        role: accountData.role,
        pin: accountData.pin
      }
    };

  } catch (error) {
    console.error(`❌ Unexpected error creating ${accountData.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔐 Creating Test Accounts for GoTryke v2.2.0...\n');
  
  const results = {
    passengers: [],
    riders: [],
    failed: []
  };

  for (const account of testAccounts) {
    const result = await createTestAccount(account);
    
    if (result.success) {
      if (account.role === 'passenger') {
        results.passengers.push(result.user);
      } else if (account.role === 'rider') {
        results.riders.push(result.user);
      }
    } else {
      results.failed.push({ 
        name: account.name, 
        phone: account.phone, 
        error: result.error 
      });
    }
    
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST ACCOUNT CREATION SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`\n👥 PASSENGER ACCOUNTS (${results.passengers.length}):`);
  results.passengers.forEach(user => {
    console.log(`   📱 +63${user.phone} - ${user.name} (PIN: ${user.pin})`);
  });
  
  console.log(`\n🚗 RIDER ACCOUNTS (${results.riders.length}):`);
  results.riders.forEach(user => {
    console.log(`   📱 +63${user.phone} - ${user.name} (PIN: ${user.pin})`);
  });
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED ACCOUNTS (${results.failed.length}):`);
    results.failed.forEach(fail => {
      console.log(`   📱 +63${fail.phone} - ${fail.name}: ${fail.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING INSTRUCTIONS:');
  console.log('='.repeat(70));
  console.log('1. Use any of the phone numbers above to test login');
  console.log('2. All PINs are 6 digits for enhanced security');
  console.log('3. Test both passenger and rider role functionality');
  console.log('4. Verify role-based dashboard access');
  console.log('5. Test authentication flow completely');
  console.log('\n🔗 Login URL: http://localhost:9002');
  console.log('\n✅ All accounts ready for testing!');
}

main().catch(console.error);