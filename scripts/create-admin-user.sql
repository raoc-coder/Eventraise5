-- Manual SQL to create admin user in Supabase
-- Run this in your Supabase SQL Editor

-- First, create the auth user (this needs to be done via Supabase Auth API or dashboard)
-- Go to Authentication > Users in your Supabase dashboard and create a user with:
-- Email: admin@eventraise.com
-- Password: admin123
-- 
-- Then run this SQL to set the admin role:

-- Update the user's metadata to include admin role
-- Replace 'USER_ID_HERE' with the actual user ID from the auth.users table
UPDATE auth.users 
SET 
  raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "name": "Test Admin"}'::jsonb
WHERE email = 'admin@eventraise.com';

-- Alternative: If you want to create a profile record
-- (uncomment if you have a profiles table)
/*
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Test Admin',
  'admin',
  now(),
  now()
FROM auth.users 
WHERE email = 'admin@eventraise.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Test Admin',
  updated_at = now();
*/

-- Verify the user was created
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
WHERE email = 'admin@eventraise.com';
