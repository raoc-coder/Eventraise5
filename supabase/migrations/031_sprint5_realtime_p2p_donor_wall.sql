-- Migration 031: Sprint 5 — P2P Realtime + public donor wall feed (ADR-0002, ADR-0012)
-- Depends on: 021, 023, 020 (donation_requests.event_id)

-- Realtime: leaderboard totals (sanitized row fields only)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_campaigns;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Public donor wall feed (no email / user_id — safe for anon Realtime)
CREATE TABLE IF NOT EXISTS public.donor_wall_feed (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donor_wall_feed_event_created
  ON public.donor_wall_feed(event_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.sync_donor_wall_feed_from_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.event_id IS NOT NULL THEN
    INSERT INTO public.donor_wall_feed (id, event_id, amount_cents, display_name, message, created_at)
    VALUES (
      NEW.id,
      NEW.event_id,
      NEW.amount_cents,
      COALESCE(NULLIF(TRIM(NEW.donor_name), ''), 'Anonymous'),
      LEFT(NEW.message, 280),
      COALESCE(NEW.created_at, now())
    )
    ON CONFLICT (id) DO UPDATE SET
      amount_cents = EXCLUDED.amount_cents,
      display_name = EXCLUDED.display_name,
      message = EXCLUDED.message,
      created_at = EXCLUDED.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_donor_wall_feed ON public.donation_requests;
CREATE TRIGGER trigger_sync_donor_wall_feed
  AFTER INSERT OR UPDATE OF status, amount_cents, donor_name, message, event_id ON public.donation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_donor_wall_feed_from_donation();

-- Backfill succeeded donations
INSERT INTO public.donor_wall_feed (id, event_id, amount_cents, display_name, message, created_at)
SELECT
  dr.id,
  dr.event_id,
  dr.amount_cents,
  COALESCE(NULLIF(TRIM(dr.donor_name), ''), 'Anonymous'),
  LEFT(dr.message, 280),
  dr.created_at
FROM public.donation_requests dr
WHERE dr.status = 'succeeded'
  AND dr.event_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.donor_wall_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS donor_wall_feed_select_published ON public.donor_wall_feed;
CREATE POLICY donor_wall_feed_select_published ON public.donor_wall_feed
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = donor_wall_feed.event_id
        AND e.is_published = true
    )
  );

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_wall_feed;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
