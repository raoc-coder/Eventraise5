-- Fix Events RLS Policies
-- This migration fixes the Row Level Security policies for the events table
-- to allow proper event creation and viewing

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Event owners can update their events" ON events;
DROP POLICY IF EXISTS "Event owners can delete their events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;

-- Create new comprehensive policies for events
-- 1. Allow everyone to view all events (public access)
CREATE POLICY "Events are publicly viewable" ON events
  FOR SELECT USING (true);

-- 2. Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow event owners to update their events (using created_by column)
CREATE POLICY "Event owners can update their events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- 4. Allow event owners to delete their events (using created_by column)
CREATE POLICY "Event owners can delete their events" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Add comment explaining the permission model
COMMENT ON TABLE events IS 'Events are publicly viewable by all users. Only event creators (created_by) can edit/delete their events.';
