#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Redirect URLs for eventraise2.vercel.app\n');

// Update .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update APP_URL
  envContent = envContent.replace(
    /NEXT_PUBLIC_APP_URL=.*/,
    'NEXT_PUBLIC_APP_URL=https://eventraise2.vercel.app'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local with production URL');
} else {
  console.log('❌ .env.local not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Update Supabase Dashboard:');
console.log('   - Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth');
console.log('   - Set Site URL to: https://eventraise2.vercel.app');
console.log('   - Add Redirect URLs:');
console.log('     * https://eventraise2.vercel.app/auth/callback');
console.log('     * https://eventraise2.vercel.app/auth/confirm');
console.log('     * http://localhost:3000/auth/callback');
console.log('     * http://localhost:3000/auth/confirm');
console.log('');
console.log('2. Deploy to Vercel:');
console.log('   - npx vercel --prod');
console.log('');
console.log('3. Test Email Confirmation:');
console.log('   - Register a new user on https://eventraise2.vercel.app');
console.log('   - Check email for confirmation link');
console.log('   - Click link - should redirect to /auth/callback');
console.log('');
console.log('🚀 Email confirmation should now work with your Vercel domain!');
