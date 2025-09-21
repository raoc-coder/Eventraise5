# 🚀 EventraiseHub Quick Setup Guide

## The Problem
You're getting "Authentication server not available" because your `.env.local` file has placeholder values instead of real Supabase keys.

## ✅ Quick Fix

### Step 1: Get Your Supabase Keys
1. Go to: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/api
2. Copy your **anon/public** key (starts with `eyJ...`)
3. Copy your **service_role** key (starts with `eyJ...`)

### Step 2: Update Your .env.local File
Replace the placeholder values in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://supabase-indigo-lamp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Stripe Configuration (keep placeholders for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Test the Connection
```bash
node scripts/test-supabase.js
```

### Step 4: Deploy Database Schema (if needed)
```bash
./scripts/deploy-supabase.sh
```

### Step 5: Start the App
```bash
npm run dev
```

## 🔧 Alternative: Use the Configuration Script
```bash
node scripts/configure-supabase.js
```

## 🆘 Still Having Issues?

### Check Your Supabase Project
1. Make sure your project is active
2. Verify the URL is correct: `https://supabase-indigo-door.supabase.co`
3. Check that you have the right keys

### Common Issues
- **Wrong URL**: Make sure it's `https://supabase-indigo-door.supabase.co`
- **Wrong Keys**: Get fresh keys from the Supabase dashboard
- **Database Not Deployed**: Run `./scripts/deploy-supabase.sh`
- **RLS Policies**: Check if Row Level Security is blocking access

### Test Commands
```bash
# Test Supabase connection
node scripts/test-supabase.js

# Check environment variables
cat .env.local

# Test the app
npm run dev
```

## 📞 Need Help?
- Check the browser console for specific error messages
- Verify your Supabase project is accessible
- Make sure you're using the correct project reference
