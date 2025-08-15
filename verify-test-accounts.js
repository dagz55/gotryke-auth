#!/usr/bin/env node

/**
 * Verify Test Accounts in GoTryke Database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testPhones = [
  '9171234567',
  '9181234568', 
  '9191234569',
  '9201234570',
  '9211234571',
  '9221234572',
  // Also check with +63 format
  '+639171234567',
  '+639181234568', 
  '+639191234569',
  '+639201234570',
  '+639211234571',
  '+639221234572'
];

async function verifyAccounts() {
  console.log('🔍 Verifying Test Accounts...\n');
  
  try {
    // Get all profiles for our test phone numbers
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('phone', testPhones);
    
    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      return;
    }
    
    console.log(`📊 Found ${profiles.length} test accounts in database:\n`);
    
    const passengers = profiles.filter(p => p.role === 'passenger');
    const riders = profiles.filter(p => p.role === 'rider');
    
    console.log('👥 PASSENGER ACCOUNTS:');
    passengers.forEach(p => {
      console.log(`   📱 +63${p.phone} - ${p.name} (Active: ${p.is_active})`);
      console.log(`      PIN: Available in database (6 digits)`);
      console.log(`      City: ${p.metadata?.city || 'Not specified'}`);
      console.log(`      Created: ${new Date(p.created_at).toLocaleDateString()}\n`);
    });
    
    console.log('🚗 RIDER ACCOUNTS:');
    riders.forEach(p => {
      console.log(`   📱 +63${p.phone} - ${p.name} (Active: ${p.is_active})`);
      console.log(`      PIN: Available in database (6 digits)`);
      console.log(`      TODA: ${p.metadata?.toda || 'Not assigned'}`);
      console.log(`      Body Number: ${p.metadata?.bodyNumber || 'Not assigned'}`);
      console.log(`      City: ${p.metadata?.city || 'Not specified'}`);
      console.log(`      Verified: ${p.metadata?.isVerified ? 'Yes' : 'No'}`);
      console.log(`      Created: ${new Date(p.created_at).toLocaleDateString()}\n`);
    });
    
    return { passengers, riders };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function main() {
  const result = await verifyAccounts();
  
  if (result && (result.passengers.length > 0 || result.riders.length > 0)) {
    console.log('✅ TEST ACCOUNTS READY FOR TESTING!');
    console.log('\n🧪 HOW TO TEST:');
    console.log('1. Go to: http://localhost:9002');
    console.log('2. Use any phone number above (without +63)');
    console.log('3. Use the 6-digit PIN for authentication');
    console.log('4. Verify role-based dashboard access');
    console.log('\n📋 TEST SCENARIOS:');
    console.log('• Test passenger login and dashboard');
    console.log('• Test rider login and dashboard');
    console.log('• Verify role-based routing works');
    console.log('• Test PIN authentication (6 digits)');
    console.log('• Check user profile data display');
  } else {
    console.log('❌ No test accounts found. They may need to be created.');
  }
}

main().catch(console.error);