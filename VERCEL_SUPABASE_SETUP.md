# 🚀 Vercel + Supabase Setup Guide

## The Situation
You're using **Vercel's managed Supabase integration**, which means:
- Supabase is managed by Vercel
- Environment variables are set in Vercel's dashboard
- No need for local `.env.local` file for Supabase keys

## ✅ How to Set Up Vercel + Supabase

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
vercel link
```

### Step 4: Add Supabase Integration
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Integrations**
4. Add **Supabase** integration
5. Connect your Supabase project

### Step 5: Set Environment Variables in Vercel
In your Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 6: Deploy Database Schema
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy schema
supabase db push
```

### Step 7: Test Locally
```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Test connection
node scripts/test-supabase.js

# Start development
npm run dev
```

## 🔧 Alternative: Manual Setup

If you prefer to set up manually:

### 1. Get Your Supabase Keys
- Go to: https://supabase.com/dashboard/project/supabase-indigo-door/settings/api
- Copy your **anon/public** key
- Copy your **service_role** key

### 2. Update .env.local
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://supabase-indigo-door.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Test Connection
```bash
node scripts/test-supabase.js
```

## 🚨 Common Issues

### "Authentication server not available"
- **Cause**: Missing or incorrect Supabase keys
- **Fix**: Ensure environment variables are set correctly

### "Database connection failed"
- **Cause**: Database schema not deployed
- **Fix**: Run `supabase db push` or `./scripts/deploy-supabase.sh`

### "Missing environment variables"
- **Cause**: Environment variables not loaded
- **Fix**: Run `vercel env pull .env.local` or set them manually

## 📋 Quick Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Test Supabase connection
node scripts/test-supabase.js

# Deploy database schema
./scripts/deploy-supabase.sh

# Start development
npm run dev
```

## 🆘 Still Having Issues?

1. **Check Vercel Dashboard**: Ensure Supabase integration is connected
2. **Verify Environment Variables**: Make sure they're set in Vercel
3. **Test Database Connection**: Run the test script
4. **Check Browser Console**: Look for specific error messages
