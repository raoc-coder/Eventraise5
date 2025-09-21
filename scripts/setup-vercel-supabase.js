#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vercel + Supabase integration...\n');

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

// Pull environment variables
console.log('\n📥 Pulling environment variables from Vercel...');
try {
  execSync('vercel env pull .env.local', { stdio: 'inherit' });
  console.log('✅ Environment variables pulled successfully');
} catch (error) {
  console.log('❌ Failed to pull environment variables');
  console.log('You may need to set them manually in Vercel dashboard');
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
  console.log('3. Deploy database schema: ./scripts/deploy-supabase.sh');
}

console.log('\n🚀 Setup complete! You can now run: npm run dev');
