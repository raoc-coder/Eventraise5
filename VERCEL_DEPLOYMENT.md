# Vercel Deployment Guide

## Fixing "Function Runtimes must have a valid version" Error

This error occurs when Vercel configuration files have incorrect runtime specifications. Here's how to fix it:

### ✅ **Solution: Remove vercel.json**

The `vercel.json` file has been removed because:
1. Next.js projects don't need custom Vercel configuration for basic deployment
2. The runtime specification was causing the error
3. Vercel automatically detects Next.js projects

### 🚀 **Simple Deployment Steps**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel runtime error"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### 🔧 **Vercel Settings**

In your Vercel project settings:

1. **General Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Environment Variables:**
   - Add all required variables (see above)
   - Make sure `NEXT_PUBLIC_APP_URL` is set to your Vercel domain

3. **Functions:**
   - Runtime: Node.js 18.x (automatic)
   - No custom configuration needed

### 🐛 **Common Issues and Solutions**

#### **"Function Runtimes must have a valid version" Error**
- **Cause:** Incorrect `vercel.json` configuration
- **Solution:** Remove `vercel.json` file (already done)

#### **Build Failures**
- **Cause:** Missing environment variables
- **Solution:** Set all environment variables in Vercel dashboard

#### **Runtime Errors**
- **Cause:** Missing dependencies or TypeScript errors
- **Solution:** Test locally first with `npm run build`

### 📋 **Pre-Deployment Checklist**

- [ ] Remove `vercel.json` file (done)
- [ ] Set all environment variables in Vercel
- [ ] Test build locally: `npm run build`
- [ ] Push code to GitHub
- [ ] Deploy from Vercel dashboard
- [ ] Test deployed application

### 🚀 **Automatic Deployments**

Once set up, Vercel will automatically:
- Deploy when you push to main branch
- Run build checks
- Handle environment variables
- Provide preview URLs for pull requests

### 💡 **Best Practices**

1. **Use Vercel's built-in GitHub integration** instead of custom workflows
2. **Set environment variables in Vercel dashboard** instead of config files
3. **Test locally before deploying** to catch issues early
4. **Use preview deployments** for testing changes

### 🔍 **Troubleshooting**

If you still get errors:

1. **Check Vercel build logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with `npm run build`
4. **Check Node.js version** is 18.x in Vercel settings

The deployment should now work without the runtime error!
