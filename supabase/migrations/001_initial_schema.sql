-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'admin');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('walkathon', 'auction', 'product_sale', 'direct_donation', 'raffle', 'other');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE volunteer_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'parent',
  organization_id UUID,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  status campaign_status DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type event_type NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE public.donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status donation_status DEFAULT 'pending',
  payment_intent_id TEXT,
  donor_name TEXT,
  donor_email TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer opportunities table
CREATE TABLE public.volunteer_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  required_skills TEXT[],
  time_commitment TEXT,
  location TEXT,
  max_volunteers INTEGER NOT NULL,
  current_volunteers INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer signups table
CREATE TABLE public.volunteer_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  volunteer_name TEXT NOT NULL,
  volunteer_email TEXT NOT NULL,
  volunteer_phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  experience TEXT,
  availability TEXT,
  notes TEXT,
  status volunteer_status DEFAULT 'pending',
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participants table
CREATE TABLE public.event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  ticket_quantity INTEGER DEFAULT 1,
  special_requests TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_organization_id ON public.campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX idx_events_organization_id ON public.events(organization_id);
CREATE INDEX idx_events_campaign_id ON public.events(campaign_id);
CREATE INDEX idx_donations_campaign_id ON public.donations(campaign_id);
CREATE INDEX idx_donations_event_id ON public.donations(event_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_volunteer_opportunities_event_id ON public.volunteer_opportunities(event_id);
CREATE INDEX idx_volunteer_opportunities_campaign_id ON public.volunteer_opportunities(campaign_id);
CREATE INDEX idx_volunteer_signups_opportunity_id ON public.volunteer_signups(opportunity_id);
CREATE INDEX idx_volunteer_signups_status ON public.volunteer_signups(status);
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_campaigns
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_donations
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_volunteer_opportunities
  BEFORE UPDATE ON public.volunteer_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_volunteer_signups
  BEFORE UPDATE ON public.volunteer_signups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_event_participants
  BEFORE UPDATE ON public.event_participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Anyone can view organizations" ON public.organizations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organization members can update organizations" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id
    )
  );

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Organization members can view their campaigns" ON public.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = campaigns.organization_id
    )
  );

CREATE POLICY "Organization members can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = campaigns.organization_id
    )
  );

CREATE POLICY "Campaign creators can update campaigns" ON public.campaigns
  FOR UPDATE USING (created_by = auth.uid());

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Organization members can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = events.organization_id
    )
  );

CREATE POLICY "Event creators can update events" ON public.events
  FOR UPDATE USING (created_by = auth.uid());

-- Donations policies
CREATE POLICY "Anyone can create donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Donors can view their own donations" ON public.donations
  FOR SELECT USING (donor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Organization members can view campaign donations" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = (
        SELECT organization_id FROM public.campaigns WHERE id = donations.campaign_id
      )
    )
  );

-- Volunteer opportunities policies
CREATE POLICY "Anyone can view volunteer opportunities" ON public.volunteer_opportunities
  FOR SELECT USING (true);

CREATE POLICY "Organization members can create volunteer opportunities" ON public.volunteer_opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.organization_id = (
          SELECT organization_id FROM public.events WHERE id = volunteer_opportunities.event_id
        ) OR
        profiles.organization_id = (
          SELECT organization_id FROM public.campaigns WHERE id = volunteer_opportunities.campaign_id
        )
      )
    )
  );

-- Volunteer signups policies
CREATE POLICY "Anyone can create volunteer signups" ON public.volunteer_signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Volunteers can view their own signups" ON public.volunteer_signups
  FOR SELECT USING (volunteer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Organization members can view volunteer signups" ON public.volunteer_signups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = (
        SELECT organization_id FROM public.events 
        WHERE id = (
          SELECT event_id FROM public.volunteer_opportunities 
          WHERE id = volunteer_signups.opportunity_id
        )
      )
    )
  );

-- Event participants policies
CREATE POLICY "Anyone can create event participants" ON public.event_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can view their own registrations" ON public.event_participants
  FOR SELECT USING (participant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Organization members can view event participants" ON public.event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = (
        SELECT organization_id FROM public.events WHERE id = event_participants.event_id
      )
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update campaign current_amount
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    UPDATE public.campaigns 
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
    UPDATE public.campaigns 
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE public.campaigns 
    SET current_amount = current_amount - NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for donation amount updates
CREATE TRIGGER update_campaign_amount_trigger
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_amount();

-- Create function to update volunteer counts
CREATE OR REPLACE FUNCTION public.update_volunteer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.volunteer_opportunities 
    SET current_volunteers = current_volunteers + 1
    WHERE id = NEW.opportunity_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'confirmed' THEN
    UPDATE public.volunteer_opportunities 
    SET current_volunteers = current_volunteers + 1
    WHERE id = NEW.opportunity_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE public.volunteer_opportunities 
    SET current_volunteers = current_volunteers - 1
    WHERE id = NEW.opportunity_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for volunteer count updates
CREATE TRIGGER update_volunteer_count_trigger
  AFTER INSERT OR UPDATE ON public.volunteer_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_volunteer_count();