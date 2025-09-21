# EventraiseHub Supabase Migration Guide

This guide will help you migrate the EventraiseHub platform to use your Supabase database at `supabase-indigo-door`.

## Prerequisites

1. **Supabase CLI** - Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. **Supabase Account** - Make sure you have access to your Supabase project

## Migration Steps

### 1. Install Supabase CLI and Login

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login
```

### 2. Link to Your Supabase Project

```bash
# Navigate to your project directory
cd /Users/raoc/Documents/GitHub/Eventraise

# Link to your Supabase project
supabase link --project-ref supabase-indigo-door
```

### 3. Deploy Database Schema

```bash
# Deploy the database schema
supabase db push

# Or run the deployment script
./scripts/deploy-supabase.sh
```

### 4. Seed Database with Sample Data

```bash
# Reset and seed the database
supabase db reset --linked
```

### 5. Generate TypeScript Types

```bash
# Generate TypeScript types for your database
supabase gen types typescript --linked > lib/database.types.ts
```

### 6. Update Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://supabase-indigo-door.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema Overview

The migration creates the following tables:

### Core Tables
- **profiles** - User profiles extending Supabase auth
- **organizations** - Schools and organizations
- **campaigns** - Fundraising campaigns
- **events** - Fundraising events
- **donations** - Donation records
- **volunteer_opportunities** - Volunteer positions
- **volunteer_signups** - Volunteer registrations
- **event_participants** - Event registrations
- **notifications** - User notifications

### Key Features
- **Row Level Security (RLS)** - Secure data access
- **Automatic Triggers** - Update timestamps and counters
- **User Roles** - Parent, Teacher, Admin permissions
- **Real-time Updates** - Live data synchronization

## Authentication Setup

### 1. Configure Auth Providers

In your Supabase dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure any additional providers (Google, GitHub, etc.)

### 2. Set Up Email Templates

1. Go to Authentication > Email Templates
2. Customize the email templates for your brand
3. Update the redirect URLs to match your domain

### 3. Configure RLS Policies

The migration includes comprehensive RLS policies:
- Users can only access their own data
- Organization members can manage their campaigns
- Public access to active campaigns and events

## Storage Setup

### 1. Create Storage Buckets

```sql
-- Create buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('campaign-images', 'campaign-images', true),
  ('event-images', 'event-images', true),
  ('organization-logos', 'organization-logos', true);
```

### 2. Set Storage Policies

```sql
-- Allow public access to campaign images
CREATE POLICY "Campaign images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-images');

-- Allow authenticated users to upload campaign images
CREATE POLICY "Users can upload campaign images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'campaign-images' AND auth.role() = 'authenticated');
```

## Testing the Migration

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Authentication

1. Visit `http://localhost:3000/auth/register`
2. Create a new account
3. Verify the user appears in your Supabase dashboard

### 3. Test Database Operations

1. Create a campaign
2. Make a donation
3. Register for an event
4. Sign up as a volunteer

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Verify your Supabase URL and keys
   - Check your network connection
   - Ensure your Supabase project is active

2. **Permission Errors**
   - Check RLS policies in Supabase dashboard
   - Verify user roles and organization memberships
   - Review the migration logs

3. **Type Errors**
   - Regenerate TypeScript types: `supabase gen types typescript --linked > lib/database.types.ts`
   - Restart your development server

### Getting Help

1. **Supabase Documentation**: https://supabase.com/docs
2. **Supabase Community**: https://github.com/supabase/supabase/discussions
3. **EventraiseHub Issues**: Create an issue in the project repository

## Production Deployment

### 1. Environment Variables

Update your production environment with:
- Production Supabase URL
- Production API keys
- Production Stripe keys
- Production domain URL

### 2. Database Backups

Set up regular database backups in your Supabase dashboard:
1. Go to Settings > Database
2. Configure backup schedules
3. Set up point-in-time recovery

### 3. Monitoring

Monitor your Supabase project:
1. Check the dashboard for errors
2. Monitor API usage and limits
3. Set up alerts for critical issues

## Next Steps

After successful migration:

1. **Customize the UI** - Update branding and styling
2. **Configure Payments** - Set up Stripe webhooks
3. **Set Up Analytics** - Add tracking and reporting
4. **Deploy to Production** - Use Vercel or your preferred platform

## Support

If you encounter any issues during migration:

1. Check the Supabase logs in your dashboard
2. Review the migration files in `supabase/migrations/`
3. Verify your environment variables
4. Test with a fresh Supabase project if needed

The EventraiseHub platform is now ready to use with your Supabase database!
