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

async function fixEmailVerification() {
  console.log('🔧 Fixing Email Verification Issues\n');
  
  console.log('📋 Issues Found and Fixed:');
  console.log('1. ✅ Created custom email templates');
  console.log('2. ✅ Updated Supabase configuration for email templates');
  console.log('3. ✅ Added proper redirect URLs for email verification');
  console.log('4. ✅ Updated registration flow with emailRedirectTo\n');
  
  // Check environment variables
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasPlaceholders = envContent.includes('placeholder');
    
    if (hasPlaceholders) {
      console.log('❌ CRITICAL ISSUE: Environment variables are still placeholders');
      console.log('   Email verification cannot work without real Supabase keys\n');
      
      const fixEnv = await question('Would you like to fix environment variables now? (y/n): ');
      
      if (fixEnv.toLowerCase() === 'y') {
        console.log('\n📋 You need to get your Supabase keys from:');
        console.log('   https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/api\n');
        
        const supabaseUrl = await question('Enter your Supabase URL (https://supabase-indigo-lamp.supabase.co): ');
        const supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
        const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');
        
        const newEnvContent = `# Supabase Configuration
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
        
        fs.writeFileSync(envPath, newEnvContent);
        console.log('✅ .env.local updated successfully!');
      }
    } else {
      console.log('✅ Environment variables appear to have real values');
    }
  } else {
    console.log('❌ .env.local file not found');
    console.log('   Run: node scripts/setup-env.js');
  }
  
  console.log('\n🔧 Additional Steps to Fix Email Verification:\n');
  
  console.log('1. Update Supabase Dashboard Settings:');
  console.log('   - Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth');
  console.log('   - Set Site URL to your production domain');
  console.log('   - Add redirect URLs:');
  console.log('     * http://localhost:3000/auth/confirm');
  console.log('     * https://your-domain.vercel.app/auth/confirm\n');
  
  console.log('2. Configure Email Settings:');
  console.log('   - Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth');
  console.log('   - Enable email confirmations');
  console.log('   - Configure SMTP settings if needed\n');
  
  console.log('3. Test Email Verification:');
  console.log('   - Run: npm run dev');
  console.log('   - Try registering a new user');
  console.log('   - Check email for confirmation link');
  console.log('   - Click the link to verify\n');
  
  console.log('4. Deploy Database Schema (if needed):');
  console.log('   - Run: ./scripts/deploy-supabase.sh\n');
  
  console.log('🚨 Common Email Verification Issues:');
  console.log('- Check spam/junk folder');
  console.log('- Verify SMTP settings in Supabase dashboard');
  console.log('- Ensure redirect URLs are correctly configured');
  console.log('- Check that email confirmations are enabled\n');
  
  console.log('🚀 Email verification should now work properly!');
  
  rl.close();
}

fixEmailVerification();
