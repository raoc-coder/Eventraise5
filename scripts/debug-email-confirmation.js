#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

async function debugEmailConfirmation() {
  console.log('🔍 Debugging Email Confirmation Issues...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('   Please check your .env.local file');
    return;
  }

  if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
    console.log('❌ Environment variables still contain placeholder values');
    console.log('   You need to update .env.local with real Supabase keys');
    console.log('   Get them from: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/api');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created');

    // Test connection
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:');
      console.log(`   Error: ${error.message}`);
      return;
    }

    console.log('✅ Database connection successful');

    console.log('\n📋 Email Confirmation Debugging Steps:');
    console.log('1. Check Supabase Dashboard Settings:');
    console.log('   - Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth');
    console.log('   - Verify Site URL is set correctly');
    console.log('   - Check redirect URLs include your domain');
    console.log('   - Ensure email confirmations are enabled\n');

    console.log('2. Test Email Confirmation Flow:');
    console.log('   - Register a new user');
    console.log('   - Check email for confirmation link');
    console.log('   - Copy the confirmation URL');
    console.log('   - Check browser console for parameter details\n');

    console.log('3. Common Issues and Solutions:');
    console.log('   ❌ "Invalid confirmation link"');
    console.log('      - Check if URL contains token_hash, type, access_token, or refresh_token');
    console.log('      - Verify redirect URL is in Supabase dashboard');
    console.log('      - Check if link has expired (24 hours)');
    console.log('   ❌ "Token expired"');
    console.log('      - Request a new confirmation email');
    console.log('      - Check if user already confirmed');
    console.log('   ❌ "Redirect URL not allowed"');
    console.log('      - Add exact URL to Supabase dashboard redirect URLs\n');

    console.log('4. Debug Information:');
    console.log('   - Check browser console for parameter logs');
    console.log('   - Verify URL structure matches expected format');
    console.log('   - Test with different email providers\n');

    console.log('🚀 Ready to test email confirmation!');

  } catch (error) {
    console.log('❌ Debug failed:');
    console.log(`   Error: ${error.message}`);
  }
}

debugEmailConfirmation();
