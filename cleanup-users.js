#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupUsers() {
  try {
    console.log('🧹 Cleaning up existing users...');
    
    // List all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error listing users:', listError);
      return;
    }
    
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`  - ${user.phone || user.email || user.id} (${user.user_metadata?.role || 'no role'})`);
      
      // Delete each user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.log(`    ❌ Error deleting: ${deleteError.message}`);
      } else {
        console.log(`    ✅ Deleted`);
      }
    }
    
    console.log('🎯 Cleanup completed!');
    
  } catch (error) {
    console.error('💥 Cleanup error:', error);
  }
}

cleanupUsers();