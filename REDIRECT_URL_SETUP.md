# 🔧 Fix Email Confirmation Redirect URLs

## The Problem
Email confirmation links are redirecting to the default Supabase URL instead of your custom `/auth/confirm` page.

## ✅ Solution

### Step 1: Update Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/supabase-indigo-lamp/settings/auth

2. **Update Site URL**:
   - Set to your production domain: `https://your-domain.vercel.app`
   - Replace `your-domain.vercel.app` with your actual Vercel domain

3. **Add Redirect URLs**:
   ```
   https://your-domain.vercel.app/auth/confirm
   https://your-domain.vercel.app/auth/callback
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   ```

### Step 2: Verify Email Settings

1. **Go to Email Settings**:
   - In the same Supabase dashboard
   - Navigate to **Authentication** → **Email**

2. **Enable Email Confirmations**:
   - Make sure "Enable email confirmations" is checked
   - Set confirmation email template if needed

3. **Configure SMTP** (if using custom SMTP):
   - Set up your email provider
   - Test email delivery

### Step 3: Test the Configuration

1. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

2. **Test Email Verification**:
   - Go to your live site
   - Register a new user
   - Check email for confirmation link
   - Click the link - it should redirect to `/auth/confirm`

3. **Check Local Development**:
   ```bash
   npm run dev
   ```
   - Test locally with `http://localhost:3000/auth/confirm`

## 🚨 Common Issues

### "Redirect URL not allowed"
- **Cause**: Redirect URL not added to Supabase dashboard
- **Fix**: Add the exact URL to redirect URLs list

### "Invalid redirect URL"
- **Cause**: URL format is incorrect
- **Fix**: Use exact format: `https://your-domain.vercel.app/auth/confirm`

### "Email not sending"
- **Cause**: SMTP not configured or email confirmations disabled
- **Fix**: Check SMTP settings and enable email confirmations

## 📋 Quick Checklist

- [ ] Site URL set to production domain
- [ ] Redirect URLs added for both production and local
- [ ] Email confirmations enabled
- [ ] SMTP configured (if needed)
- [ ] Tested email delivery
- [ ] Verified redirect works

## 🔧 Alternative: Manual URL Override

If you need to override the redirect URL programmatically:

```javascript
const { error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/confirm`
  }
})
```

This ensures the redirect URL is set correctly for each registration.
