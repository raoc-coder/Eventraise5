-- Events and Registration Schema
-- This migration creates the complete events and registration system

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('fundraiser', 'volunteer', 'community', 'sports', 'educational', 'social')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  organization_name TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event categories for better organization
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'calendar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO event_categories (name, description, color, icon) VALUES
('Fundraiser', 'Events focused on raising money for causes', '#EF4444', 'heart'),
('Volunteer', 'Community service and volunteer opportunities', '#10B981', 'users'),
('Community', 'Local community events and gatherings', '#3B82F6', 'map-pin'),
('Sports', 'Athletic events and competitions', '#F59E0B', 'trophy'),
('Educational', 'Learning and educational events', '#8B5CF6', 'book-open'),
('Social', 'Social gatherings and networking events', '#EC4899', 'users');

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id),
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  ticket_quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_intent_id TEXT,
  checkout_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  special_requests TEXT,
  dietary_restrictions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer shifts table
CREATE TABLE IF NOT EXISTS volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_volunteers INTEGER NOT NULL,
  current_volunteers INTEGER DEFAULT 0,
  requirements TEXT,
  skills_needed TEXT[],
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer sign-ups table
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES volunteer_shifts(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES auth.users(id),
  volunteer_name TEXT NOT NULL,
  volunteer_email TEXT NOT NULL,
  volunteer_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show')),
  skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  availability_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event tickets table for different ticket types
CREATE TABLE IF NOT EXISTS event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sales_start_date TIMESTAMP WITH TIME ZONE,
  sales_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event sponsors table
CREATE TABLE IF NOT EXISTS event_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_website TEXT,
  sponsor_level TEXT CHECK (sponsor_level IN ('platinum', 'gold', 'silver', 'bronze')),
  contribution_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_participant_id ON event_registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_event_id ON volunteer_shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_start_time ON volunteer_shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_is_active ON volunteer_shifts(is_active);

CREATE INDEX IF NOT EXISTS idx_volunteer_signups_shift_id ON volunteer_signups(shift_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_volunteer_id ON volunteer_signups(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_status ON volunteer_signups(status);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event_id ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_is_active ON event_tickets(is_active);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET current_participants = current_participants + NEW.ticket_quantity
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE events 
    SET current_participants = current_participants - OLD.ticket_quantity + NEW.ticket_quantity
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET current_participants = current_participants - OLD.ticket_quantity
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_volunteer_shift_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE volunteer_shifts 
    SET current_volunteers = current_volunteers + 1
    WHERE id = NEW.shift_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE volunteer_shifts 
    SET current_volunteers = current_volunteers - 1
    WHERE id = OLD.shift_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_event_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

CREATE TRIGGER trigger_update_volunteer_shift_count
  AFTER INSERT OR DELETE ON volunteer_signups
  FOR EACH ROW EXECUTE FUNCTION update_volunteer_shift_count();

-- Row Level Security (RLS) policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = participant_id OR auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = event_id
  ));

CREATE POLICY "Users can create registrations" ON event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own registrations" ON event_registrations
  FOR UPDATE USING (auth.uid() = participant_id OR auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = event_id
  ));

-- Volunteer shifts policies
CREATE POLICY "Volunteer shifts are viewable by everyone" ON volunteer_shifts
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage shifts" ON volunteer_shifts
  FOR ALL USING (auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = event_id
  ));

-- Volunteer signups policies
CREATE POLICY "Users can view their own signups" ON volunteer_signups
  FOR SELECT USING (auth.uid() = volunteer_id OR auth.uid() IN (
    SELECT e.organizer_id FROM events e 
    JOIN volunteer_shifts vs ON e.id = vs.event_id 
    WHERE vs.id = shift_id
  ));

CREATE POLICY "Users can create volunteer signups" ON volunteer_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own signups" ON volunteer_signups
  FOR UPDATE USING (auth.uid() = volunteer_id);

-- Event tickets policies
CREATE POLICY "Event tickets are viewable by everyone" ON event_tickets
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage tickets" ON event_tickets
  FOR ALL USING (auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = event_id
  ));

-- Event sponsors policies
CREATE POLICY "Event sponsors are viewable by everyone" ON event_sponsors
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage sponsors" ON event_sponsors
  FOR ALL USING (auth.uid() IN (
    SELECT organizer_id FROM events WHERE id = event_id
  ));

-- Insert sample data for testing
INSERT INTO events (
  title, description, event_type, start_date, end_date, location, 
  max_participants, ticket_price, goal_amount, organization_name, 
  organizer_id, is_featured, is_published
) VALUES
(
  'Spring Fundraising Gala',
  'Join us for an elegant evening of dining, dancing, and fundraising for our school programs. This black-tie event features live music, silent auction, and special guest speakers.',
  'fundraiser',
  '2024-04-15 18:00:00+00',
  '2024-04-15 23:00:00+00',
  'Grand Ballroom, Downtown Convention Center',
  200,
  150.00,
  50000.00,
  'EventraiseHUB Community Foundation',
  (SELECT id FROM auth.users LIMIT 1),
  true,
  true
),
(
  'Community Cleanup Day',
  'Help us keep our community beautiful! Join volunteers for a day of cleaning up local parks, streets, and public spaces. All supplies provided.',
  'volunteer',
  '2024-04-20 09:00:00+00',
  '2024-04-20 15:00:00+00',
  'Central Park, Main Street',
  100,
  0.00,
  5000.00,
  'Green Community Initiative',
  (SELECT id FROM auth.users LIMIT 1),
  false,
  true
),
(
  'Youth Sports Tournament',
  'Watch exciting youth sports competitions in basketball, soccer, and track & field. Food vendors, family activities, and awards ceremony.',
  'sports',
  '2024-04-25 08:00:00+00',
  '2024-04-25 18:00:00+00',
  'Community Sports Complex',
  500,
  25.00,
  10000.00,
  'Youth Sports Association',
  (SELECT id FROM auth.users LIMIT 1),
  true,
  true
);

-- Insert sample volunteer shifts
INSERT INTO volunteer_shifts (event_id, title, description, start_time, end_time, max_volunteers, requirements, skills_needed, location)
SELECT 
  e.id,
  'Setup and Preparation',
  'Help set up tables, decorations, and event materials',
  e.start_date - INTERVAL '2 hours',
  e.start_date,
  10,
  'Must be able to lift 25+ lbs',
  ARRAY['setup', 'decorating', 'organization'],
  e.location
FROM events e 
WHERE e.title = 'Spring Fundraising Gala';

INSERT INTO volunteer_shifts (event_id, title, description, start_time, end_time, max_volunteers, requirements, skills_needed, location)
SELECT 
  e.id,
  'Event Coordination',
  'Help coordinate activities, assist guests, and manage event flow',
  e.start_date,
  e.end_date,
  15,
  'Friendly and organized',
  ARRAY['coordination', 'customer_service', 'communication'],
  e.location
FROM events e 
WHERE e.title = 'Spring Fundraising Gala';

INSERT INTO volunteer_shifts (event_id, title, description, start_time, end_time, max_volunteers, requirements, skills_needed, location)
SELECT 
  e.id,
  'Cleanup Crew',
  'Help clean up after the event and pack materials',
  e.end_date,
  e.end_date + INTERVAL '2 hours',
  8,
  'Must be able to lift 25+ lbs',
  ARRAY['cleanup', 'organization', 'teamwork'],
  e.location
FROM events e 
WHERE e.title = 'Spring Fundraising Gala';
