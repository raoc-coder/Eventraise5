-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE event_type AS ENUM ('walkathon', 'auction', 'product_sale', 'direct_donation', 'raffle');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE volunteer_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  organization_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'organizer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  tax_id TEXT,
  address JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participants
CREATE TABLE public.event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'completed')),
  custom_fields JSONB DEFAULT '{}',
  UNIQUE(event_id, user_id)
);

-- Volunteer opportunities
CREATE TABLE public.volunteer_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  time_commitment TEXT,
  location TEXT,
  max_volunteers INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer signups
CREATE TABLE public.volunteer_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status volunteer_status DEFAULT 'pending',
  notes TEXT,
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);

-- Donations table
CREATE TABLE public.donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status donation_status DEFAULT 'pending',
  payment_intent_id TEXT,
  stripe_charge_id TEXT,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  tax_receipt_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction items
CREATE TABLE public.auction_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starting_bid DECIMAL(10,2),
  current_bid DECIMAL(10,2) DEFAULT 0,
  reserve_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT,
  donor_name TEXT,
  is_active BOOLEAN DEFAULT true,
  auction_start TIMESTAMP WITH TIME ZONE,
  auction_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction bids
CREATE TABLE public.auction_bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES public.auction_items(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raffle tickets
CREATE TABLE public.raffle_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboards
CREATE TABLE public.leaderboards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_raised DECIMAL(10,2) DEFAULT 0,
  total_donations INTEGER DEFAULT 0,
  rank INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE public.email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_organization ON public.events(organization_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_donations_event ON public.donations(event_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_volunteer_signups_opportunity ON public.volunteer_signups(opportunity_id);
CREATE INDEX idx_leaderboards_event ON public.leaderboards(event_id);
CREATE INDEX idx_leaderboards_rank ON public.leaderboards(event_id, rank);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public events are viewable by everyone" ON public.events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Event organizers can manage their events" ON public.events
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view donations for public events" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = donations.event_id 
      AND events.is_public = true
    )
  );

CREATE POLICY "Users can create donations" ON public.donations
  FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_opportunities_updated_at BEFORE UPDATE ON public.volunteer_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_items_updated_at BEFORE UPDATE ON public.auction_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
