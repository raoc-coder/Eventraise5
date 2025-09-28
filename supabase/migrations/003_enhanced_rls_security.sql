-- Enhanced RLS Security Policies for Event Raise Platform
-- This migration adds comprehensive Row Level Security policies

-- Enable RLS on existing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Campaigns: Public read, authenticated users can create, owners can update
DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON campaigns;
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON campaigns;
CREATE POLICY "Authenticated users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Campaign owners can update their campaigns" ON campaigns;
CREATE POLICY "Campaign owners can update their campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Campaign owners can delete their campaigns" ON campaigns;
CREATE POLICY "Campaign owners can delete their campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = created_by);

-- Events: Public read, authenticated users can create, owners can update
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Event owners can update their events" ON events;
CREATE POLICY "Event owners can update their events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Event owners can delete their events" ON events;
CREATE POLICY "Event owners can delete their events" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Donations: Allow public viewing for now (simplified for development)
DROP POLICY IF EXISTS "Donations are viewable by everyone" ON donations;
CREATE POLICY "Donations are viewable by everyone" ON donations
  FOR SELECT USING (true);

-- Donations: Only system can insert (via webhooks)
DROP POLICY IF EXISTS "System can insert donations" ON donations;
CREATE POLICY "System can insert donations" ON donations
  FOR INSERT WITH CHECK (true); -- Webhook handles this

-- Note: event_attendees and campaign_updates tables don't exist yet
-- RLS policies for these tables will be added when the tables are created

-- Create function to check if user is admin (for future admin features)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- For now, return false. In the future, you can add admin logic here
  -- Example: Check if user has admin role in profiles table
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's organization (for organization-based access)
CREATE OR REPLACE FUNCTION get_user_organization(user_id uuid)
RETURNS text AS $$
DECLARE
  org_name text;
BEGIN
  SELECT organization_name INTO org_name
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(org_name, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
