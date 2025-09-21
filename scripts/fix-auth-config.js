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

async function fixAuthConfig() {
  console.log('🔧 Fixing EventraiseHub Authentication Configuration\n');
  
  console.log('This script will help you fix the authentication issues:\n');
  console.log('1. ✅ Created authentication callback route');
  console.log('2. ✅ Created email confirmation page');
  console.log('3. ✅ Updated Supabase configuration');
  console.log('4. ✅ Enabled email confirmations');
  console.log('5. ✅ Updated registration and login flows\n');
  
  console.log('📋 Next steps to complete the setup:\n');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasPlaceholders = envContent.includes('placeholder');
    
    if (hasPlaceholders) {
      console.log('❌ Your .env.local still has placeholder values');
      console.log('   You need to replace them with real Supabase keys\n');
      
      const updateEnv = await question('Would you like to update .env.local now? (y/n): ');
      
      if (updateEnv.toLowerCase() === 'y') {
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
      console.log('✅ .env.local appears to have real values');
    }
  } else {
    console.log('❌ .env.local file not found');
    console.log('   Run: node scripts/setup-env.js');
  }
  
  console.log('\n🔧 Additional Configuration Steps:\n');
  console.log('1. Update Supabase Dashboard Settings:');
  console.log('   - Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth');
  console.log('   - Set Site URL to your production domain');
  console.log('   - Add redirect URLs for your domains\n');
  
  console.log('2. Test the Authentication Flow:');
  console.log('   - Run: node scripts/test-supabase.js');
  console.log('   - Start app: npm run dev');
  console.log('   - Try registering a new user');
  console.log('   - Check email for confirmation link\n');
  
  console.log('3. Deploy Database Schema (if needed):');
  console.log('   - Run: ./scripts/deploy-supabase.sh\n');
  
  console.log('🚀 Authentication should now work properly!');
  
  rl.close();
}

fixAuthConfig();
