#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('   Please check your .env.local file');
    console.log('   Run: node scripts/setup-env.js');
    process.exit(1);
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
      process.exit(1);
    }

    console.log('✅ Database connection successful');
    console.log('✅ Supabase is ready to use!');

  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }
}

testSupabaseConnection();
