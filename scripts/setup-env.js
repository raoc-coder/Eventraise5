#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 EventRaise Environment Setup');
console.log('================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env.local from env.example');
  } else {
    console.log('❌ env.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n📋 Environment Variables Checklist:');
console.log('====================================');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const envContent = fs.readFileSync(envPath, 'utf8');
let allConfigured = true;

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && !match[1].includes('your_')) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`❌ ${varName} - Please configure this variable`);
    allConfigured = false;
  }
});

console.log('\n🔧 Next Steps:');
console.log('==============');

if (!allConfigured) {
  console.log('1. Edit .env.local and configure all environment variables');
  console.log('2. Get your Supabase credentials from: https://supabase.com/dashboard');
  console.log('3. Get your Stripe credentials from: https://dashboard.stripe.com/apikeys');
  console.log('4. For production, set NEXT_PUBLIC_APP_URL to your Vercel domain');
} else {
  console.log('✅ All environment variables are configured!');
  console.log('🚀 You can now run: npm run dev');
}

console.log('\n📚 For deployment help, see DEPLOYMENT.md');
