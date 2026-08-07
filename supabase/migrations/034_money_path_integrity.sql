-- Migration 034: Sprint 7 money-path integrity
-- Unique capture ids, atomic ticket inventory, auction vault setup binding.
-- Ensures PayPal capture columns exist (may be missing if 010 never applied).

-- ---------------------------------------------------------------------------
-- 0) Ensure PayPal capture columns exist (from migration 010 intent)
-- ---------------------------------------------------------------------------
ALTER TABLE public.donation_requests
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- ---------------------------------------------------------------------------
-- 1) Idempotent donation / ticket settlement keys
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_donation_requests_paypal_capture_id
  ON public.donation_requests (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL AND length(trim(paypal_capture_id)) > 0;

CREATE UNIQUE INDEX IF NOT EXISTS uq_event_registrations_paypal_capture_id
  ON public.event_registrations (paypal_capture_id)
  WHERE paypal_capture_id IS NOT NULL AND length(trim(paypal_capture_id)) > 0;

-- ---------------------------------------------------------------------------
-- 2) Atomic ticket inventory
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_event_ticket_sold(
  p_ticket_id uuid,
  p_qty integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF p_qty IS NULL OR p_qty < 1 THEN
    RETURN false;
  END IF;

  UPDATE public.event_tickets
  SET quantity_sold = quantity_sold + p_qty
  WHERE id = p_ticket_id
    AND (quantity_total IS NULL OR quantity_sold + p_qty <= quantity_total);

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_event_ticket_sold(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_event_ticket_sold(uuid, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Auction vault setup binding (setup token → user/auction)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auction_vault_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setup_token_id TEXT NOT NULL,
  payment_method_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  CONSTRAINT auction_vault_setups_setup_token_unique UNIQUE (setup_token_id)
);

CREATE INDEX IF NOT EXISTS idx_auction_vault_setups_user_auction
  ON public.auction_vault_setups (auction_id, user_id);

ALTER TABLE public.auction_vault_setups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auction_vault_setups_deny_all ON public.auction_vault_setups;
CREATE POLICY auction_vault_setups_deny_all ON public.auction_vault_setups
  FOR ALL USING (false);
