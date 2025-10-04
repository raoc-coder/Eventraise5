-- Fix Events RLS Policies - Final Version
-- This migration consolidates all RLS policies for the events table
-- to ensure proper authentication and authorization

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Events are publicly viewable" ON events;
DROP POLICY IF EXISTS "Event owners can update their events" ON events;
DROP POLICY IF EXISTS "Event owners can delete their events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;

-- Create comprehensive policies that handle both organizer_id and created_by columns
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

-- Add comment explaining the permission model
COMMENT ON TABLE events IS 'Events are publicly viewable by all users. Only event creators (organizer_id or created_by) can edit/delete their events.';
