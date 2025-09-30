-- RSVP and Tickets Foundation

-- event_tickets: ticket catalog per event (for future paid tickets)
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  quantity_total INTEGER,
  quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  sales_start_at TIMESTAMPTZ,
  sales_end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- event_registrations: RSVP/registration records (also used later for ticket claims)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('rsvp','ticket')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  name TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for event_tickets
-- Anyone can read tickets for published events
DROP POLICY IF EXISTS "Tickets readable for published events" ON public.event_tickets;
CREATE POLICY "Tickets readable for published events" ON public.event_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_tickets.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

-- Owners/Admins can insert/update/delete tickets
DROP POLICY IF EXISTS "Owners manage tickets" ON public.event_tickets;
CREATE POLICY "Owners manage tickets" ON public.event_tickets
  FOR ALL USING (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = event_tickets.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = event_tickets.event_id), NULL)
  ) WITH CHECK (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = event_tickets.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = event_tickets.event_id), NULL)
  );

-- Policies for event_registrations
-- Public can create RSVP for published events (no auth required)
DROP POLICY IF EXISTS "Public can RSVP for published events" ON public.event_registrations;
CREATE POLICY "Public can RSVP for published events" ON public.event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_registrations.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

-- Users can read their own registrations
DROP POLICY IF EXISTS "Users read own registrations" ON public.event_registrations;
CREATE POLICY "Users read own registrations" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid());

-- Owners/Admins can read all registrations for their events
DROP POLICY IF EXISTS "Owners read registrations" ON public.event_registrations;
CREATE POLICY "Owners read registrations" ON public.event_registrations
  FOR SELECT USING (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = event_registrations.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = event_registrations.event_id), NULL)
  );

-- Owners/Admins can manage registrations
DROP POLICY IF EXISTS "Owners manage registrations" ON public.event_registrations;
CREATE POLICY "Owners manage registrations" ON public.event_registrations
  FOR ALL USING (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = event_registrations.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = event_registrations.event_id), NULL)
  ) WITH CHECK (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = event_registrations.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = event_registrations.event_id), NULL)
  );


