-- Enhanced RLS Security Policies for Event Raise Platform
-- This migration adds comprehensive Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

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
  FOR UPDATE USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Campaign owners can delete their campaigns" ON campaigns;
CREATE POLICY "Campaign owners can delete their campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = organizer_id);

-- Events: Public read, authenticated users can create, owners can update
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Event owners can update their events" ON events;
CREATE POLICY "Event owners can update their events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Event owners can delete their events" ON events;
CREATE POLICY "Event owners can delete their events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

-- Donations: Users can view their own donations, campaign owners can view donations to their campaigns
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;
CREATE POLICY "Users can view their own donations" ON donations
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Campaign owners can view donations to their campaigns" ON donations;
CREATE POLICY "Campaign owners can view donations to their campaigns" ON donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = donations.campaign_id 
      AND campaigns.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anonymous donations are viewable by campaign owners" ON donations;
CREATE POLICY "Anonymous donations are viewable by campaign owners" ON donations
  FOR SELECT USING (
    profile_id IS NULL AND
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = donations.campaign_id 
      AND campaigns.organizer_id = auth.uid()
    )
  );

-- Donations: Only system can insert (via webhooks)
DROP POLICY IF EXISTS "System can insert donations" ON donations;
CREATE POLICY "System can insert donations" ON donations
  FOR INSERT WITH CHECK (true); -- Webhook handles this

-- Event Attendees: Users can manage their own attendance
DROP POLICY IF EXISTS "Users can view their own event attendance" ON event_attendees;
CREATE POLICY "Users can view their own event attendance" ON event_attendees
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can register for events" ON event_attendees;
CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own attendance" ON event_attendees;
CREATE POLICY "Users can update their own attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can cancel their own attendance" ON event_attendees;
CREATE POLICY "Users can cancel their own attendance" ON event_attendees
  FOR DELETE USING (auth.uid() = profile_id);

-- Event organizers can view attendees for their events
DROP POLICY IF EXISTS "Event organizers can view attendees" ON event_attendees;
CREATE POLICY "Event organizers can view attendees" ON event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_attendees.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Campaign Updates: Campaign owners can manage updates
DROP POLICY IF EXISTS "Campaign updates are viewable by everyone" ON campaign_updates;
CREATE POLICY "Campaign updates are viewable by everyone" ON campaign_updates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Campaign owners can create updates" ON campaign_updates;
CREATE POLICY "Campaign owners can create updates" ON campaign_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_updates.campaign_id 
      AND campaigns.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Campaign owners can update their updates" ON campaign_updates;
CREATE POLICY "Campaign owners can update their updates" ON campaign_updates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_updates.campaign_id 
      AND campaigns.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Campaign owners can delete their updates" ON campaign_updates;
CREATE POLICY "Campaign owners can delete their updates" ON campaign_updates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_updates.campaign_id 
      AND campaigns.organizer_id = auth.uid()
    )
  );

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
