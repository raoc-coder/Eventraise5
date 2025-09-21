# Deployment Guide for EventRaise

## Fixing Vercel Deployment Issues

### Common Issues and Solutions

#### 1. Localhost:3000 Error
This error occurs when environment variables are not properly configured for production.

**Solution:**
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables" section
4. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Important:** Replace `your-app-name.vercel.app` with your actual Vercel domain.

#### 2. Build Errors
If you're getting build errors, check:

1. **Node.js Version**: Ensure you're using Node.js 18+
2. **Dependencies**: Run `npm install` locally to check for dependency issues
3. **TypeScript Errors**: Run `npx tsc --noEmit` to check for TypeScript errors

#### 3. Environment Variables Not Loading
Make sure all environment variables are set in Vercel dashboard and are prefixed correctly:
- `NEXT_PUBLIC_*` variables are available in the browser
- Other variables are only available on the server

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository and click "Import"

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project
   - Click "Settings" → "Environment Variables"
   - Add all the variables from your `.env.local` file
   - **Important**: Set `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for the deployment to complete
   - Test your application

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain (e.g., https://your-app.vercel.app)

### Testing Your Deployment

1. **Check the homepage** - Should load without errors
2. **Test authentication** - Try signing up and logging in
3. **Test event creation** - Create a new event
4. **Test payments** - Try making a donation (use Stripe test mode)

### Troubleshooting

#### If you still get localhost:3000 errors:
1. Check that `NEXT_PUBLIC_APP_URL` is set to your Vercel domain
2. Redeploy the application after setting environment variables
3. Check the Vercel function logs for any errors

#### If Supabase connection fails:
1. Verify your Supabase URL and keys are correct
2. Check that your Supabase project is active
3. Ensure RLS policies are properly configured

#### If Stripe payments fail:
1. Verify your Stripe keys are correct
2. Check that you're using the right keys for your environment (test vs live)
3. Ensure webhook endpoints are configured in Stripe dashboard

### Production Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database schema is deployed to Supabase
- [ ] Stripe webhooks are configured
- [ ] Domain is properly configured
- [ ] SSL certificate is active
- [ ] Application is tested end-to-end
