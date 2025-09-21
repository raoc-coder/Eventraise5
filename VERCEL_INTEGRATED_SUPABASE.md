# 🚀 Vercel Integrated Supabase Setup

## The Situation
You're using **Vercel's integrated Supabase** where:
- Vercel manages your Supabase account
- Environment variables are automatically provided
- No need to manually configure Supabase keys
- Everything is handled through Vercel's dashboard

## ✅ How to Set This Up

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

### Step 4: Pull Environment Variables
```bash
vercel env pull .env.local
```

This will automatically pull all the Supabase environment variables that Vercel manages for you.

### Step 5: Test the Connection
```bash
node scripts/test-supabase.js
```

### Step 6: Deploy Database Schema
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your Vercel-managed project
supabase link --project-ref supabase-indigo-lamp

# Deploy schema
supabase db push
```

## 🔧 Alternative: Manual Setup

If you prefer to set up manually:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project
- Go to **Settings** → **Environment Variables**

### 2. Check for Supabase Variables
Look for these variables (they should be automatically set by Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Copy to Local Environment
Copy these values to your `.env.local` file.

## 🚨 Common Issues

### "Authentication server not available"
- **Cause**: Environment variables not loaded from Vercel
- **Fix**: Run `vercel env pull .env.local`

### "Database connection failed"
- **Cause**: Database schema not deployed
- **Fix**: Run `supabase db push`

### "Missing environment variables"
- **Cause**: Vercel integration not set up
- **Fix**: Check Vercel dashboard for Supabase integration

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
supabase db push

# Start development
npm run dev
```

## 🆘 Still Having Issues?

1. **Check Vercel Dashboard**: Ensure Supabase integration is active
2. **Verify Environment Variables**: Make sure they're set in Vercel
3. **Test Database Connection**: Run the test script
4. **Check Browser Console**: Look for specific error messages
