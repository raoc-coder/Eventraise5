#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vercel Integrated Supabase...\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Vercel CLI');
    console.log('Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('❌ Not logged in to Vercel');
  console.log('Please run: vercel login');
  process.exit(1);
}

// Check if project is linked
try {
  execSync('vercel ls', { stdio: 'pipe' });
  console.log('✅ Vercel project is linked');
} catch (error) {
  console.log('❌ Project not linked to Vercel');
  console.log('Please run: vercel link');
  process.exit(1);
}

// Pull environment variables from Vercel
console.log('\n📥 Pulling environment variables from Vercel...');
try {
  execSync('vercel env pull .env.local', { stdio: 'inherit' });
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

console.log('\n🚀 Setup complete! You can now run: npm run dev');
