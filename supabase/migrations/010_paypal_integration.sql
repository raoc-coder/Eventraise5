-- PayPal integration tables
CREATE TABLE IF NOT EXISTS public.paypal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
  paypal_fee_cents INTEGER NOT NULL CHECK (paypal_fee_cents >= 0),
  net_amount_cents INTEGER NOT NULL CHECK (net_amount_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'completed', 'denied', 'refunded')),
  type TEXT NOT NULL CHECK (type IN ('donation', 'ticket', 'rsvp')),
  ticket_id UUID REFERENCES public.event_tickets(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  capture_id TEXT,
  captured_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add PayPal fields to existing tables
ALTER TABLE public.donation_requests 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paypal_orders_event_id ON public.paypal_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_paypal_orders_status ON public.paypal_orders(status);
CREATE INDEX IF NOT EXISTS idx_paypal_orders_created_at ON public.paypal_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_donation_requests_paypal_order_id ON public.donation_requests(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_paypal_order_id ON public.event_registrations(paypal_order_id);

-- Enable RLS
ALTER TABLE public.paypal_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paypal_orders
DROP POLICY IF EXISTS "Public can create PayPal orders" ON public.paypal_orders;
CREATE POLICY "Public can create PayPal orders" ON public.paypal_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Event owners can view their PayPal orders" ON public.paypal_orders;
CREATE POLICY "Event owners can view their PayPal orders" ON public.paypal_orders
  FOR SELECT USING (
    auth.uid() = COALESCE((SELECT created_by FROM public.events WHERE id = paypal_orders.event_id), NULL)
    OR auth.uid() = COALESCE((SELECT organizer_id FROM public.events WHERE id = paypal_orders.event_id), NULL)
  );

DROP POLICY IF EXISTS "Admins can view all PayPal orders" ON public.paypal_orders;
CREATE POLICY "Admins can view all PayPal orders" ON public.paypal_orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE app_metadata->>'role' = 'admin' 
      OR user_metadata->>'role' = 'admin'
    )
  );

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for paypal_orders updated_at
DROP TRIGGER IF EXISTS update_paypal_orders_updated_at ON public.paypal_orders;
CREATE TRIGGER update_paypal_orders_updated_at
    BEFORE UPDATE ON public.paypal_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
