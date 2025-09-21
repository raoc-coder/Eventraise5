# Build Troubleshooting Guide

## Common Build Failures and Solutions

### 1. **Environment Variables Missing**
**Error:** `NEXT_PUBLIC_SUPABASE_URL is not defined`

**Solution:**
```bash
# Run the setup script
npm run setup

# Or manually create .env.local
cp env.example .env.local
# Then edit .env.local with your actual values
```

### 2. **TypeScript Errors**
**Error:** `Type error: Cannot find module '@/components/ui/button'`

**Solution:**
```bash
# Check TypeScript configuration
npm run type-check

# If errors persist, check your tsconfig.json paths
```

### 3. **Missing Dependencies**
**Error:** `Module not found: Can't resolve 'tailwind-merge'`

**Solution:**
```bash
# Install missing dependencies
npm install

# Or install specific missing packages
npm install tailwind-merge
```

### 4. **Vercel Build Failures**

#### **Environment Variables Not Set in Vercel**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

#### **Node.js Version Issues**
1. In Vercel Dashboard → Settings → General
2. Set Node.js Version to 18.x

#### **Build Command Issues**
1. In Vercel Dashboard → Settings → General
2. Set Build Command to: `npm run build`
3. Set Output Directory to: `.next`

### 5. **Local Build Issues**

#### **Clean Install**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Try building again
npm run build
```

#### **Check for TypeScript Errors**
```bash
# Run type check
npm run type-check

# Fix any TypeScript errors before building
```

#### **Check for ESLint Errors**
```bash
# Run linter
npm run lint

# Fix any linting errors
```

### 6. **Specific Error Solutions**

#### **"Cannot resolve module" errors**
- Check if the package is installed: `npm list package-name`
- Check if the import path is correct
- Check if the file exists

#### **"Property does not exist on type" errors**
- Check TypeScript types
- Add proper type definitions
- Use `any` type as temporary fix

#### **"Module not found" errors**
- Check if the file exists
- Check if the path is correct
- Check if the file has proper exports

### 7. **Build Optimization**

#### **Reduce Bundle Size**
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
npm run build
npm run analyze
```

#### **Check Build Output**
```bash
# Build with verbose output
npm run build -- --debug

# Check build logs for specific errors
```

### 8. **Vercel-Specific Issues**

#### **Function Timeout**
- Increase function timeout in Vercel settings
- Optimize API routes

#### **Memory Issues**
- Increase memory allocation in Vercel
- Optimize code to use less memory

#### **Build Timeout**
- Optimize build process
- Remove unnecessary dependencies
- Use build caching

### 9. **Quick Fixes**

#### **Reset Everything**
```bash
# Clean everything
rm -rf node_modules package-lock.json .next

# Reinstall
npm install

# Build
npm run build
```

#### **Check Environment**
```bash
# Run build check
npm run build-check

# This will identify common issues
```

### 10. **Getting Help**

If you're still having issues:

1. **Check the build logs** in Vercel dashboard
2. **Run locally** to see if the issue is environment-specific
3. **Check the GitHub Actions logs** if using CI/CD
4. **Look at the specific error message** and search for solutions

#### **Common Error Messages and Solutions:**

- `Module not found` → Install missing package
- `Type error` → Fix TypeScript issues
- `Environment variable not defined` → Set environment variables
- `Build timeout` → Optimize build process
- `Memory limit exceeded` → Increase memory or optimize code

### 11. **Prevention**

To avoid build issues:

1. **Always test locally** before pushing
2. **Use proper TypeScript types**
3. **Keep dependencies updated**
4. **Use environment variables properly**
5. **Follow Next.js best practices**

## Quick Commands

```bash
# Setup environment
npm run setup

# Check for issues
npm run build-check

# Type check
npm run type-check

# Lint check
npm run lint

# Build
npm run build

# Clean and rebuild
rm -rf node_modules package-lock.json .next && npm install && npm run build
```
