#!/usr/bin/env node

// Simple test script to validate our authentication logic
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuth() {
  try {
    console.log('🧪 Testing Supabase authentication...');
    
    // Test 1: Create a test user
    console.log('\n1️⃣ Creating test user...');
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      phone: '+639171841002',
      password: '1234',
      user_metadata: {
        name: 'Test Admin',
        role: 'admin'
      },
      phone_confirm: true
    });
    
    if (createError) {
      console.log('❌ Create user error:', createError.message);
      if (!createError.message.includes('already registered')) {
        return;
      }
      console.log('ℹ️  User already exists, continuing with login test...');
    } else {
      console.log('✅ User created:', createData.user.id);
    }
    
    // Test 2: Try to sign in with phone and PIN
    console.log('\n2️⃣ Testing sign-in with phone and PIN...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      phone: '+639171841002',
      password: '1234'
    });
    
    if (signInError) {
      console.log('❌ Sign-in error:', signInError.message);
      return;
    }
    
    if (signInData.user && signInData.session) {
      console.log('✅ Sign-in successful!');
      console.log('   User ID:', signInData.user.id);
      console.log('   Phone:', signInData.user.phone);
      console.log('   Role:', signInData.user.user_metadata?.role);
      console.log('   Session:', !!signInData.session);
      console.log('   Access Token:', signInData.session.access_token ? 'Present' : 'Missing');
    } else {
      console.log('❌ Sign-in failed - no user or session returned');
    }
    
    // Test 3: Test with wrong PIN
    console.log('\n3️⃣ Testing sign-in with wrong PIN...');
    const { data: wrongData, error: wrongError } = await supabase.auth.signInWithPassword({
      phone: '+639171841002',
      password: '9999'
    });
    
    if (wrongError) {
      console.log('✅ Wrong PIN correctly rejected:', wrongError.message);
    } else {
      console.log('❌ Wrong PIN was accepted - this is a security issue!');
    }
    
    console.log('\n🎯 Authentication test completed!');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testAuth();