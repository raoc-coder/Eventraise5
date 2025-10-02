-- Ticketing System Enhancements
-- This migration enhances the existing ticketing system for full functionality

-- Add ticket purchase tracking to event_registrations
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS ticket_id UUID REFERENCES public.event_tickets(id),
ADD COLUMN IF NOT EXISTS total_amount_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- Add ticket sales tracking to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS ticket_sales_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_ticket_sales_cents INTEGER DEFAULT 0;

-- Create ticket_purchases table for detailed purchase tracking
CREATE TABLE IF NOT EXISTS public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_amount_cents INTEGER NOT NULL CHECK (total_amount_cents >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_event_id ON public.ticket_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_ticket_id ON public.ticket_purchases(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_registration_id ON public.ticket_purchases(registration_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_payment_status ON public.ticket_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_ticket_id ON public.event_registrations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON public.event_registrations(payment_status);

-- Enable RLS
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ticket_purchases
-- Organizers can view purchases for their events
CREATE POLICY "Organizers can view ticket purchases" ON public.ticket_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE public.events.id = public.ticket_purchases.event_id 
      AND public.events.organizer_id = auth.uid()
    )
  );

-- Admins can view all ticket purchases
CREATE POLICY "Admins can view all ticket purchases" ON public.ticket_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.id = auth.uid() 
      AND public.profiles.role = 'admin'
    )
  );

-- Function to update ticket sales when a purchase is made
CREATE OR REPLACE FUNCTION public.update_ticket_sales()
RETURNS TRIGGER AS $$
BEGIN
  -- Update quantity_sold in event_tickets
  UPDATE public.event_tickets 
  SET quantity_sold = quantity_sold + NEW.quantity
  WHERE id = NEW.ticket_id;
  
  -- Update total ticket sales in events
  UPDATE public.events 
  SET total_ticket_sales_cents = total_ticket_sales_cents + NEW.total_amount_cents
  WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sales when ticket purchase is completed
DROP TRIGGER IF EXISTS trigger_update_ticket_sales ON public.ticket_purchases;
CREATE TRIGGER trigger_update_ticket_sales
  AFTER INSERT ON public.ticket_purchases
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION public.update_ticket_sales();

-- Function to create ticket purchase record
CREATE OR REPLACE FUNCTION public.create_ticket_purchase(
  p_event_id UUID,
  p_ticket_id UUID,
  p_registration_id UUID,
  p_quantity INTEGER,
  p_unit_price_cents INTEGER,
  p_total_amount_cents INTEGER
) RETURNS UUID AS $$
DECLARE
  purchase_id UUID;
BEGIN
  INSERT INTO public.ticket_purchases (
    event_id,
    ticket_id,
    registration_id,
    quantity,
    unit_price_cents,
    total_amount_cents
  ) VALUES (
    p_event_id,
    p_ticket_id,
    p_registration_id,
    p_quantity,
    p_unit_price_cents,
    p_total_amount_cents
  ) RETURNING id INTO purchase_id;
  
  RETURN purchase_id;
END;
$$ LANGUAGE plpgsql;
