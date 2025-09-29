#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up EventraiseHub environment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env.local from env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created successfully!\n');
  } else {
    console.log('❌ env.example not found. Please create .env.local manually.\n');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local already exists.\n');
}

// Display the required environment variables
console.log('📝 Required Environment Variables:');
console.log('=====================================');
console.log('');
console.log('1. Supabase Configuration:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://supabase-indigo-lamp.supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('');
console.log('2. Braintree Configuration (for payments):');
console.log('   BRAINTREE_MERCHANT_ID=your_braintree_merchant_id');
console.log('   BRAINTREE_PUBLIC_KEY=your_braintree_public_key');
console.log('   BRAINTREE_PRIVATE_KEY=your_braintree_private_key');
console.log('');
console.log('3. App Configuration:');
console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000');
console.log('');
console.log('🔗 Get your Supabase keys from:');
console.log('   https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/api');
console.log('');
console.log('💳 Get your Braintree keys from:');
console.log('   https://sandbox.braintreegateway.com');
console.log('');
console.log('📖 For detailed setup instructions, see:');
console.log('   SUPABASE_MIGRATION.md');
console.log('');
console.log('🚀 Once configured, run: npm run dev');