#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vercel-Managed Supabase...\n');

// Check if Vercel CLI is available
try {
  execSync('npx vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is available');
} catch (error) {
  console.log('❌ Vercel CLI not found');
  console.log('Please install: npm install -g vercel');
  process.exit(1);
}

// Check if user is logged in to Vercel
try {
  execSync('npx vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('❌ Not logged in to Vercel');
  console.log('Please run: npx vercel login');
  process.exit(1);
}

// Check if project is linked
try {
  execSync('npx vercel ls', { stdio: 'pipe' });
  console.log('✅ Vercel project is linked');
} catch (error) {
  console.log('❌ Project not linked to Vercel');
  console.log('Please run: npx vercel link');
  process.exit(1);
}

// Pull environment variables from Vercel
console.log('\n📥 Pulling environment variables from Vercel...');
try {
  execSync('npx vercel env pull .env.local', { stdio: 'inherit' });
  console.log('✅ Environment variables pulled successfully');
} catch (error) {
  console.log('❌ Failed to pull environment variables');
  console.log('You may need to set up Supabase integration in Vercel dashboard');
}

// Check if Supabase variables are present
console.log('\n🔍 Checking for Supabase environment variables...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const hasSupabaseServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY');
  
  if (hasSupabaseUrl && hasSupabaseAnonKey && hasSupabaseServiceKey) {
    console.log('✅ Supabase environment variables found');
    
    // Check if they're real values (not placeholders)
    const hasPlaceholders = envContent.includes('placeholder');
    if (hasPlaceholders) {
      console.log('⚠️  Environment variables contain placeholder values');
      console.log('   You may need to set up Supabase integration in Vercel dashboard');
    } else {
      console.log('✅ Environment variables appear to have real values');
    }
  } else {
    console.log('❌ Missing Supabase environment variables');
    console.log('You may need to:');
    console.log('1. Set up Supabase integration in Vercel dashboard');
    console.log('2. Add environment variables in Vercel');
  }
} else {
  console.log('❌ .env.local file not found');
}

// Test Supabase connection
console.log('\n🔍 Testing Supabase connection...');
try {
  execSync('node scripts/test-supabase.js', { stdio: 'inherit' });
  console.log('✅ Supabase connection successful!');
} catch (error) {
  console.log('❌ Supabase connection failed');
  console.log('You may need to:');
  console.log('1. Set up Supabase integration in Vercel dashboard');
  console.log('2. Add environment variables in Vercel');
  console.log('3. Deploy database schema: supabase db push');
}

console.log('\n📋 Next Steps:');
console.log('1. If environment variables are missing, set up Supabase integration in Vercel dashboard');
console.log('2. Deploy database schema: supabase db push');
console.log('3. Start development: npm run dev');
console.log('\n🚀 Setup complete!');
