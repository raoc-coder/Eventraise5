#!/usr/bin/env node

/**
 * Script to create a test admin user in Supabase
 * Run with: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    
    // Also create a profile record if you have a profiles table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: 'admin@eventraise.com',
          name: 'Test Admin',
          role: 'admin'
        })
      
      if (profileError && !profileError.message.includes('duplicate key')) {
        console.warn('⚠️  Could not create profile record:', profileError.message)
      } else {
        console.log('✅ Profile record created')
      }
    } catch (e) {
      console.warn('⚠️  No profiles table found, skipping profile creation')
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  }
}

createAdminUser()
