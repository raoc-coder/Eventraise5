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

async function testEmailVerification() {
  console.log('🔍 Testing Email Verification Setup...\n');

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

    // Test connection by fetching from a public table
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:');
      console.log(`   Error: ${error.message}`);
      console.log('   This might mean:');
      console.log('   1. The database schema hasn\'t been deployed yet');
      console.log('   2. The Supabase URL or keys are incorrect');
      console.log('   3. RLS policies are blocking access');
      console.log('');
      console.log('   Try running: ./scripts/deploy-supabase.sh');
      return;
    }

    console.log('✅ Database connection successful');
    console.log('✅ Supabase is ready for email verification!');

    console.log('\n📋 Next Steps to Test Email Verification:');
    console.log('1. Start the app: npm run dev');
    console.log('2. Go to: http://localhost:3000/auth/register');
    console.log('3. Register a new user with a real email address');
    console.log('4. Check your email for the confirmation link');
    console.log('5. Click the link to verify your account');
    console.log('6. Try logging in with the verified account');

    console.log('\n🚨 If emails don\'t arrive:');
    console.log('- Check spam/junk folder');
    console.log('- Verify SMTP settings in Supabase dashboard');
    console.log('- Ensure email confirmations are enabled');
    console.log('- Check redirect URLs are configured correctly');

  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
  }
}

testEmailVerification();
