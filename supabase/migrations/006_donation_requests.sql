-- Donation Requests schema (additive, safe)

CREATE TABLE IF NOT EXISTS public.donation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft','pending','succeeded','failed','cancelled')),
  payment_intent_id TEXT,
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent indexes
CREATE INDEX IF NOT EXISTS idx_donation_requests_user_id ON public.donation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_campaign_id ON public.donation_requests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON public.donation_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_donation_requests_payment_intent
  ON public.donation_requests(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- Ensure updated_at maintained
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_donation_requests'
  ) THEN
    CREATE TRIGGER handle_updated_at_donation_requests
      BEFORE UPDATE ON public.donation_requests
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- Owners can read their own donation requests
DROP POLICY IF EXISTS "Users can view own donation requests" ON public.donation_requests;
CREATE POLICY "Users can view own donation requests" ON public.donation_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Owners can insert their own donation requests
DROP POLICY IF EXISTS "Users can create donation requests" ON public.donation_requests;
CREATE POLICY "Users can create donation requests" ON public.donation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owners can update their own donation requests (non-finalized)
DROP POLICY IF EXISTS "Users can update own draft/pending donation requests" ON public.donation_requests;
CREATE POLICY "Users can update own draft/pending donation requests" ON public.donation_requests
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('draft','pending'));

-- ---------------------------------------------------------------------------
-- Merged from former 006_fix_event_permissions.sql (same migration version).
-- ---------------------------------------------------------------------------

-- Fix Event Permissions Migration
-- This migration ensures that all users can view events created by others
-- while maintaining edit/delete permissions for event creators only

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Event owners can update their events" ON events;
DROP POLICY IF EXISTS "Event owners can delete their events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create new comprehensive policies that handle both organizer_id and created_by columns

-- 1. Allow everyone to view all events (public access)
CREATE POLICY "Events are publicly viewable" ON events
  FOR SELECT USING (true);

-- 2. Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow event owners to update their events (handles both organizer_id and created_by)
CREATE POLICY "Event owners can update their events" ON events
  FOR UPDATE USING (
    auth.uid() = COALESCE(organizer_id, created_by)
  );

-- 4. Allow event owners to delete their events (handles both organizer_id and created_by)
CREATE POLICY "Event owners can delete their events" ON events
  FOR DELETE USING (
    auth.uid() = COALESCE(organizer_id, created_by)
  );

-- Ensure the events table has the necessary columns
-- Add organizer_id if it doesn't exist (for backward compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
        ALTER TABLE events ADD COLUMN organizer_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add created_by if it doesn't exist (for backward compatibility)  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_by') THEN
        ALTER TABLE events ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add is_published column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_published') THEN
        ALTER TABLE events ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Update existing events to be published by default
UPDATE events SET is_published = TRUE WHERE is_published IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);

-- Add a comment explaining the permission model
COMMENT ON TABLE events IS 'Events are publicly viewable by all users. Only event creators (organizer_id or created_by) can edit/delete their events.';
