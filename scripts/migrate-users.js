#!/usr/bin/env node

/**
 * User Migration Script: Firebase to Supabase
 * 
 * This script migrates users from Firebase Auth to Supabase Auth
 * while preserving user roles and creating secure PIN-based authentication.
 * 
 * Usage: node scripts/migrate-users.js
 */

require('dotenv').config()

// Check if Firebase Admin is available (optional dependency)
let admin;
try {
  admin = require('firebase-admin')
} catch (error) {
  console.error('Firebase Admin SDK not found. Please install: npm install firebase-admin')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

// Check if bcrypt is available
let bcrypt;
try {
  bcrypt = require('bcrypt')
} catch (error) {
  console.error('bcrypt not found. Please install: npm install bcrypt @types/bcrypt')
  process.exit(1)
}

// Firebase Admin SDK setup
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  })
}

// Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Migration configuration
const BATCH_SIZE = 100
const DEFAULT_PIN = '1234' // Users will need to reset this
const SALT_ROUNDS = 12

// Role mapping from Firebase to Supabase
const ROLE_MAPPING = {
  'admin': 'admin',
  'dispatcher': 'dispatcher',
  'guide': 'guide',
  'passenger': 'passenger',
  'rider': 'rider',
  // Add any custom role mappings here
}

// Utility functions
const formatPhoneNumber = (phone) => {
  if (!phone) return null
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('63')) {
    return `+${cleanPhone}`
  }
  if (cleanPhone.startsWith('9')) {
    return `+63${cleanPhone}`
  }
  return `+63${cleanPhone}`
}

const hashPin = async (pin) => {
  return await bcrypt.hash(pin, SALT_ROUNDS)
}

const extractUserData = (firebaseUser) => {
  const customClaims = firebaseUser.customClaims || {}
  const metadata = firebaseUser.metadata || {}
  
  return {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    phone: formatPhoneNumber(firebaseUser.phoneNumber),
    name: firebaseUser.displayName || customClaims.name || 'Unknown User',
    role: ROLE_MAPPING[customClaims.role] || 'passenger',
    disabled: firebaseUser.disabled || false,
    createdAt: new Date(metadata.creationTime),
    lastSignIn: metadata.lastSignInTime ? new Date(metadata.lastSignInTime) : null,
    customClaims: customClaims
  }
}

// Main migration functions
async function fetchFirebaseUsers(nextPageToken = null) {
  try {
    const listUsersResult = await admin.auth().listUsers(BATCH_SIZE, nextPageToken)
    return {
      users: listUsersResult.users,
      nextPageToken: listUsersResult.pageToken
    }
  } catch (error) {
    console.error('Error fetching Firebase users:', error)
    throw error
  }
}

async function createSupabaseUser(userData) {
  try {
    // Generate secure PIN hash
    const pinHash = await hashPin(DEFAULT_PIN)
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: userData.phone,
      password: require('crypto').randomUUID(), // Random password since we use PIN
      user_metadata: {
        name: userData.name,
        role: userData.role,
        pin_hash: pinHash,
        firebase_uid: userData.firebaseUid,
        migrated_at: new Date().toISOString()
      },
      phone_confirm: true // Skip phone confirmation for migrated users
    })
    
    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`)
    }
    
    return {
      success: true,
      supabaseUserId: authData.user.id,
      userData: userData
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      userData: userData
    }
  }
}

async function migrateUserBatch(firebaseUsers) {
  const results = {
    successful: [],
    failed: [],
    skipped: []
  }
  
  for (const firebaseUser of firebaseUsers) {
    try {
      const userData = extractUserData(firebaseUser)
      
      // Skip users without phone numbers
      if (!userData.phone) {
        console.log(`Skipping user ${firebaseUser.uid} - no phone number`)
        results.skipped.push({
          firebaseUid: firebaseUser.uid,
          reason: 'No phone number'
        })
        continue
      }
      
      // Check if user already exists in Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', userData.phone)
        .single()
      
      if (existingProfile) {
        console.log(`User already exists: ${userData.phone}`)
        results.skipped.push({
          firebaseUid: firebaseUser.uid,
          phone: userData.phone,
          reason: 'Already exists'
        })
        continue
      }
      
      // Create user in Supabase
      const migrationResult = await createSupabaseUser(userData)
      
      if (migrationResult.success) {
        console.log(`✅ Migrated: ${userData.phone} (${userData.name})`)
        results.successful.push({
          firebaseUid: firebaseUser.uid,
          supabaseUserId: migrationResult.supabaseUserId,
          phone: userData.phone,
          name: userData.name,
          role: userData.role
        })
      } else {
        console.error(`❌ Failed to migrate: ${userData.phone} - ${migrationResult.error}`)
        results.failed.push({
          firebaseUid: firebaseUser.uid,
          phone: userData.phone,
          error: migrationResult.error
        })
      }
      
    } catch (error) {
      console.error(`❌ Error processing user ${firebaseUser.uid}:`, error)
      results.failed.push({
        firebaseUid: firebaseUser.uid,
        error: error.message
      })
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

async function generateMigrationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_processed: results.successful.length + results.failed.length + results.skipped.length,
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    },
    successful_migrations: results.successful,
    failed_migrations: results.failed,
    skipped_users: results.skipped
  }
  
  // Save report to file
  const fs = require('fs')
  const reportPath = `migration-report-${Date.now()}.json`
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log('\n=== MIGRATION REPORT ===')
  console.log(`Total processed: ${report.summary.total_processed}`)
  console.log(`✅ Successful: ${report.summary.successful}`)
  console.log(`❌ Failed: ${report.summary.failed}`)
  console.log(`⏭️  Skipped: ${report.summary.skipped}`)
  console.log(`📄 Full report saved to: ${reportPath}`)
  
  return report
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting user migration from Firebase to Supabase...')
  console.log(`📊 Batch size: ${BATCH_SIZE}`)
  console.log(`🔐 Default PIN: ${DEFAULT_PIN} (users should reset this)\n`)
  
  const allResults = {
    successful: [],
    failed: [],
    skipped: []
  }
  
  let nextPageToken = null
  let batchNumber = 1
  
  try {
    do {
      console.log(`📦 Processing batch ${batchNumber}...`)
      
      const { users, nextPageToken: token } = await fetchFirebaseUsers(nextPageToken)
      nextPageToken = token
      
      if (users.length === 0) {
        console.log('No more users to process.')
        break
      }
      
      const batchResults = await migrateUserBatch(users)
      
      // Aggregate results
      allResults.successful.push(...batchResults.successful)
      allResults.failed.push(...batchResults.failed)
      allResults.skipped.push(...batchResults.skipped)
      
      console.log(`Batch ${batchNumber} complete. Success: ${batchResults.successful.length}, Failed: ${batchResults.failed.length}, Skipped: ${batchResults.skipped.length}\n`)
      
      batchNumber++
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } while (nextPageToken)
    
    // Generate final report
    await generateMigrationReport(allResults)
    
    console.log('\n🎉 Migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Pre-migration checks
async function runPreMigrationChecks() {
  console.log('🔍 Running pre-migration checks...')
  
  // Check Firebase connection
  try {
    await admin.auth().listUsers(1)
    console.log('✅ Firebase connection: OK')
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message)
    process.exit(1)
  }
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) throw error
    console.log('✅ Supabase connection: OK')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    process.exit(1)
  }
  
  // Check required environment variables
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '))
    process.exit(1)
  }
  
  console.log('✅ Environment variables: OK')
  console.log('✅ Pre-migration checks passed!\n')
}

// Dry run function to preview what would be migrated
async function runDryRun() {
  console.log('🔍 Running dry run (no actual migration)...')
  
  let totalUsers = 0
  let usersWithPhones = 0
  let existingUsers = 0
  let nextPageToken = null
  
  do {
    const { users, nextPageToken: token } = await fetchFirebaseUsers(nextPageToken)
    nextPageToken = token
    
    for (const firebaseUser of users) {
      totalUsers++
      const userData = extractUserData(firebaseUser)
      
      if (userData.phone) {
        usersWithPhones++
        
        // Check if user already exists in Supabase
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', userData.phone)
          .single()
        
        if (existingProfile) {
          existingUsers++
        }
      }
    }
    
  } while (nextPageToken)
  
  console.log('\n=== DRY RUN SUMMARY ===')
  console.log(`Total Firebase users: ${totalUsers}`)
  console.log(`Users with phone numbers: ${usersWithPhones}`)
  console.log(`Users already in Supabase: ${existingUsers}`)
  console.log(`Users to be migrated: ${usersWithPhones - existingUsers}`)
  
  return {
    totalUsers,
    usersWithPhones,
    existingUsers,
    toMigrate: usersWithPhones - existingUsers
  }
}

// Command line argument handling
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run') || args.includes('-d')
const isHelp = args.includes('--help') || args.includes('-h')

if (isHelp) {
  console.log(`
Firebase to Supabase User Migration Script

Usage:
  node scripts/migrate-users.js [options]

Options:
  --dry-run, -d    Run in dry-run mode (preview only, no migration)
  --help, -h       Show this help message

Environment Variables Required:
  FIREBASE_PROJECT_ID
  FIREBASE_PRIVATE_KEY 
  FIREBASE_CLIENT_EMAIL
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Example:
  node scripts/migrate-users.js --dry-run
  `)
  process.exit(0)
}

// Run migration
if (require.main === module) {
  (async () => {
    try {
      await runPreMigrationChecks()
      
      if (isDryRun) {
        await runDryRun()
      } else {
        await runMigration()
      }
      
      process.exit(0)
    } catch (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
  })()
}

module.exports = {
  runMigration,
  runDryRun,
  extractUserData,
  formatPhoneNumber
}