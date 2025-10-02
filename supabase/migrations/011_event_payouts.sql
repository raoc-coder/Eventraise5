-- Event-Based Payout System
-- This migration creates a proper per-event, per-organizer payout system

-- Add organizer tracking to donation_requests
ALTER TABLE public.donation_requests 
ADD COLUMN IF NOT EXISTS event_organizer_id UUID REFERENCES auth.users(id);

-- Create event_payouts table to track payouts per event per organizer
CREATE TABLE IF NOT EXISTS public.event_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  total_gross_cents INTEGER NOT NULL DEFAULT 0,
  total_fees_cents INTEGER NOT NULL DEFAULT 0,
  total_net_cents INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payout_method TEXT, -- 'paypal', 'bank_transfer', 'check', etc.
  payout_reference TEXT, -- transaction ID, check number, etc.
  payout_date TIMESTAMP WITH TIME ZONE,
  payout_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payout_items table to track individual donations in each payout
CREATE TABLE IF NOT EXISTS public.payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES public.event_payouts(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES public.donation_requests(id),
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  net_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_payouts_event_id ON public.event_payouts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_payouts_organizer_id ON public.event_payouts(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_payouts_status ON public.event_payouts(payout_status);
CREATE INDEX IF NOT EXISTS idx_payout_items_payout_id ON public.payout_items(payout_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_donation_id ON public.payout_items(donation_id);

-- Add RLS policies
ALTER TABLE public.event_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;

-- Organizers can view their own payouts
CREATE POLICY "Organizers can view own payouts" ON public.event_payouts
  FOR SELECT USING (auth.uid() = organizer_id);

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts" ON public.event_payouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.user_metadata->>'role' = 'admin' OR auth.users.app_metadata->>'role' = 'admin')
    )
  );

-- Payout items inherit permissions from parent payout
CREATE POLICY "Payout items inherit parent permissions" ON public.payout_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.event_payouts 
      WHERE public.event_payouts.id = public.payout_items.payout_id
      AND (
        auth.uid() = public.event_payouts.organizer_id OR
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND (auth.users.user_metadata->>'role' = 'admin' OR auth.users.app_metadata->>'role' = 'admin')
        )
      )
    )
  );

-- Function to update event_organizer_id in donation_requests when event is created
CREATE OR REPLACE FUNCTION public.update_donation_organizer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update donation_requests to link to event organizer
  UPDATE public.donation_requests 
  SET event_organizer_id = NEW.organizer_id
  WHERE event_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set organizer_id when event is created/updated
DROP TRIGGER IF EXISTS trigger_update_donation_organizer ON public.events;
CREATE TRIGGER trigger_update_donation_organizer
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_donation_organizer();

-- Function to calculate and create payout for an event
CREATE OR REPLACE FUNCTION public.create_event_payout(event_uuid UUID)
RETURNS UUID AS $$
DECLARE
  payout_id UUID;
  organizer_uuid UUID;
  gross_total INTEGER;
  fees_total INTEGER;
  net_total INTEGER;
BEGIN
  -- Get the event organizer
  SELECT organizer_id INTO organizer_uuid 
  FROM public.events 
  WHERE id = event_uuid;
  
  IF organizer_uuid IS NULL THEN
    RAISE EXCEPTION 'Event organizer not found for event %', event_uuid;
  END IF;
  
  -- Calculate totals for completed donations
  SELECT 
    COALESCE(SUM(amount_cents), 0),
    COALESCE(SUM(fee_cents), 0),
    COALESCE(SUM(net_cents), 0)
  INTO gross_total, fees_total, net_total
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status = 'completed'
    AND settlement_status = 'settled';
  
  -- Create the payout record
  INSERT INTO public.event_payouts (
    event_id, 
    organizer_id, 
    total_gross_cents, 
    total_fees_cents, 
    total_net_cents
  ) VALUES (
    event_uuid,
    organizer_uuid,
    gross_total,
    fees_total,
    net_total
  ) RETURNING id INTO payout_id;
  
  -- Create payout items for each donation
  INSERT INTO public.payout_items (
    payout_id,
    donation_id,
    amount_cents,
    fee_cents,
    net_cents
  )
  SELECT 
    payout_id,
    id,
    amount_cents,
    fee_cents,
    net_cents
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status = 'completed'
    AND settlement_status = 'settled';
  
  RETURN payout_id;
END;
$$ LANGUAGE plpgsql;
