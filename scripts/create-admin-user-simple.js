#!/usr/bin/env node

/**
 * Simple script to create a test admin user in Supabase
 * 
 * Usage:
 * 1. Get your Supabase URL and Service Role Key from your Supabase dashboard
 * 2. Run: SUPABASE_URL=your_url SUPABASE_KEY=your_key node scripts/create-admin-user-simple.js
 * 
 * Or edit the values below and run: node scripts/create-admin-user-simple.js
 */

const { createClient } = require('@supabase/supabase-js')

// Replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY || 'your-service-role-key'

if (SUPABASE_URL.includes('your-project') || SUPABASE_SERVICE_KEY.includes('your-service')) {
  console.log('❌ Please set your Supabase credentials:')
  console.log('   SUPABASE_URL=your_url SUPABASE_KEY=your_key node scripts/create-admin-user-simple.js')
  console.log('')
  console.log('   Or edit the script and replace the placeholder values.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createAdminUser() {
  try {
    console.log('🔧 Creating test admin user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@eventraise.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Test Admin'
      }
    })
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@eventraise.com')
    console.log('🔑 Password: admin123')
    console.log('🆔 User ID:', authData.user.id)
    console.log('👤 Role: admin')
    console.log('')
    console.log('🎯 You can now:')
    console.log('   1. Go to /admin/payouts')
    console.log('   2. Login with admin@eventraise.com / admin123')
    console.log('   3. Make a test donation to see data')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  }
}

createAdminUser()
