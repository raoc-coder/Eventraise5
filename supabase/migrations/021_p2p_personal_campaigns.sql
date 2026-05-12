-- Migration 021: P2P personal campaigns (Sprint 1 / US 1.1)
-- ADR refs: 0001 (SQL migrations), 0010 (auth model), 0011 (integer cents), 0012 (RLS)
-- Idempotent: safe to re-run.

-- 1) Table: public.personal_campaigns
CREATE TABLE IF NOT EXISTS public.personal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NULL, -- forward-declared; FK added in migration 022 (teams)
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  story TEXT,
  goal_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (goal_amount_cents >= 0),
  total_raised_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_raised_cents >= 0),
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_personal_campaigns_event
  ON public.personal_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_owner
  ON public.personal_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_status
  ON public.personal_campaigns(status);

-- 2) updated_at trigger (reuses public.handle_updated_at from migration 001)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_personal_campaigns'
  ) THEN
    CREATE TRIGGER handle_updated_at_personal_campaigns
      BEFORE UPDATE ON public.personal_campaigns
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 3) Add personal_campaign_id to donation_requests (active donation table since migration 006/020).
--    Sprint 2 will extend this with team_id; left out here intentionally.
ALTER TABLE public.donation_requests
  ADD COLUMN IF NOT EXISTS personal_campaign_id UUID
  REFERENCES public.personal_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_donation_requests_personal_campaign
  ON public.donation_requests(personal_campaign_id);

-- 4) Rollup: keep personal_campaigns.total_raised_cents in sync with succeeded donations.
CREATE OR REPLACE FUNCTION public.update_personal_campaign_total_raised()
RETURNS TRIGGER AS $$
DECLARE
  v_new_pc UUID := COALESCE(NEW.personal_campaign_id, NULL);
  v_old_pc UUID := COALESCE(OLD.personal_campaign_id, NULL);
  v_new_status TEXT := COALESCE(NEW.status, '');
  v_old_status TEXT := COALESCE(OLD.status, '');
BEGIN
  -- INSERT: credit if new row is succeeded and tied to a personal campaign
  IF TG_OP = 'INSERT' THEN
    IF v_new_pc IS NOT NULL AND v_new_status = 'succeeded' THEN
      UPDATE public.personal_campaigns
        SET total_raised_cents = total_raised_cents + NEW.amount_cents
        WHERE id = v_new_pc;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: handle all transitions affecting the rollup
  IF TG_OP = 'UPDATE' THEN
    -- Case A: personal_campaign_id changed (rare; admin reassignment)
    IF v_new_pc IS DISTINCT FROM v_old_pc THEN
      IF v_old_pc IS NOT NULL AND v_old_status = 'succeeded' THEN
        UPDATE public.personal_campaigns
          SET total_raised_cents = GREATEST(0, total_raised_cents - OLD.amount_cents)
          WHERE id = v_old_pc;
      END IF;
      IF v_new_pc IS NOT NULL AND v_new_status = 'succeeded' THEN
        UPDATE public.personal_campaigns
          SET total_raised_cents = total_raised_cents + NEW.amount_cents
          WHERE id = v_new_pc;
      END IF;
      RETURN NEW;
    END IF;

    -- Case B: same personal_campaign_id, status moved into 'succeeded'
    IF v_new_pc IS NOT NULL
       AND v_old_status <> 'succeeded'
       AND v_new_status = 'succeeded' THEN
      UPDATE public.personal_campaigns
        SET total_raised_cents = total_raised_cents + NEW.amount_cents
        WHERE id = v_new_pc;
      RETURN NEW;
    END IF;

    -- Case C: same personal_campaign_id, status moved out of 'succeeded'
    IF v_old_pc IS NOT NULL
       AND v_old_status = 'succeeded'
       AND v_new_status <> 'succeeded' THEN
      UPDATE public.personal_campaigns
        SET total_raised_cents = GREATEST(0, total_raised_cents - OLD.amount_cents)
        WHERE id = v_old_pc;
      RETURN NEW;
    END IF;

    -- Case D: succeeded row, amount changed in place
    IF v_new_pc IS NOT NULL
       AND v_new_status = 'succeeded'
       AND OLD.amount_cents <> NEW.amount_cents THEN
      UPDATE public.personal_campaigns
        SET total_raised_cents = GREATEST(
          0,
          total_raised_cents - OLD.amount_cents + NEW.amount_cents
        )
        WHERE id = v_new_pc;
      RETURN NEW;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_personal_campaign_total_raised
  ON public.donation_requests;
CREATE TRIGGER trigger_update_personal_campaign_total_raised
  AFTER INSERT OR UPDATE ON public.donation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_personal_campaign_total_raised();

-- 5) Row-Level Security
ALTER TABLE public.personal_campaigns ENABLE ROW LEVEL SECURITY;

-- 5a) Anyone (including unauthenticated visitors) can view active personal pages.
DROP POLICY IF EXISTS "Anyone can view active personal campaigns"
  ON public.personal_campaigns;
CREATE POLICY "Anyone can view active personal campaigns"
  ON public.personal_campaigns
  FOR SELECT
  USING (status = 'active');

-- 5b) Owners can see their own pages regardless of status.
DROP POLICY IF EXISTS "Owners can view their personal campaigns"
  ON public.personal_campaigns;
CREATE POLICY "Owners can view their personal campaigns"
  ON public.personal_campaigns
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 5c) Authenticated users can create a page they own.
DROP POLICY IF EXISTS "Authenticated users can create their personal campaigns"
  ON public.personal_campaigns;
CREATE POLICY "Authenticated users can create their personal campaigns"
  ON public.personal_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 5d) Owners can update their own pages.
DROP POLICY IF EXISTS "Owners can update their personal campaigns"
  ON public.personal_campaigns;
CREATE POLICY "Owners can update their personal campaigns"
  ON public.personal_campaigns
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5e) Owners can delete (soft-delete preferred via status='cancelled'; hard-delete allowed for now).
DROP POLICY IF EXISTS "Owners can delete their personal campaigns"
  ON public.personal_campaigns;
CREATE POLICY "Owners can delete their personal campaigns"
  ON public.personal_campaigns
  FOR DELETE
  USING (auth.uid() = owner_id);
