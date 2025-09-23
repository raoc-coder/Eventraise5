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


