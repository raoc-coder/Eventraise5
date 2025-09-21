#!/usr/bin/env node

// Build configuration for EventRaise
// This ensures all required environment variables are available during build

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

console.log('🔧 Setting up build environment...');

// Check if we're in a CI environment (Vercel, GitHub Actions, etc.)
const isCI = process.env.CI || process.env.VERCEL || process.env.GITHUB_ACTIONS;

if (isCI) {
  console.log('📦 Running in CI environment');
  
  // Set fallback values for build if environment variables are not available
  const fallbacks = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder_anon_key',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
    NEXT_PUBLIC_APP_URL: 'https://placeholder.vercel.app'
  };

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`⚠️  ${varName} not set, using fallback for build`);
      process.env[varName] = fallbacks[varName];
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
} else {
  console.log('🏠 Running in local environment');
  
  // Check if .env.local exists
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local not found');
    console.log('   Using fallback values for build');
    
    // Set fallback values for build
    const fallbacks = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder_anon_key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
      NEXT_PUBLIC_APP_URL: 'https://placeholder.vercel.app'
    };

    Object.entries(fallbacks).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }
}

console.log('✅ Build environment configured');
