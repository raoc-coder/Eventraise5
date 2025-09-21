#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureSupabase() {
  console.log('🔧 EventraiseHub Supabase Configuration\n');
  console.log('This script will help you configure your Supabase connection.\n');
  
  console.log('📋 You need to get your Supabase keys from:');
  console.log('   https://supabase.com/dashboard/project/supabase-indigo-door/settings/api\n');
  
  const supabaseUrl = await question('Enter your Supabase URL (https://supabase-indigo-door.supabase.co): ');
  const supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
  const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');
  
  console.log('\n🔍 Validating connection...');
  
  // Test the connection
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:');
      console.log(`   Error: ${error.message}`);
      console.log('\n💡 This might mean:');
      console.log('   1. The database schema hasn\'t been deployed yet');
      console.log('   2. The Supabase URL or keys are incorrect');
      console.log('   3. RLS policies are blocking access');
      console.log('\n🛠️  Try running: ./scripts/deploy-supabase.sh');
      rl.close();
      return;
    }
    
    console.log('✅ Connection test successful!');
    
    // Update .env.local
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
    
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.local updated successfully!');
    console.log('\n🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.log('❌ Configuration failed:');
    console.log(`   Error: ${error.message}`);
  }
  
  rl.close();
}

configureSupabase();
