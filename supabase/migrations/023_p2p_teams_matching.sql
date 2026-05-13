-- Migration 023: P2P teams, matching gifts, idempotency column (Sprint 2 / Epic 1)
-- ADR refs: 0001, 0011 (cents), 0012 (RLS), 0009 (idempotency on writes)
-- Depends on: 021 (personal_campaigns, donation rollup), 020 (donation_requests.event_id)

-- 0) Idempotency replay key for POST /api/personal-campaigns (ADR-0009)
ALTER TABLE public.personal_campaigns
  ADD COLUMN IF NOT EXISTS client_idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_personal_campaigns_owner_idempotency
  ON public.personal_campaigns(owner_id, client_idempotency_key)
  WHERE client_idempotency_key IS NOT NULL;

-- 1) Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_raised_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_raised_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_teams_event ON public.teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_teams'
  ) THEN
    CREATE TRIGGER handle_updated_at_teams
      BEFORE UPDATE ON public.teams
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 2) Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- 3) FK personal_campaigns.team_id -> teams (021 left team_id nullable without FK)
ALTER TABLE public.personal_campaigns
  DROP CONSTRAINT IF EXISTS fk_personal_campaigns_team;
ALTER TABLE public.personal_campaigns
  ADD CONSTRAINT fk_personal_campaigns_team
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- 4) Matching gifts (one active row per event enforced below)
CREATE TABLE IF NOT EXISTS public.matching_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Matching gift',
  cap_cents INTEGER NOT NULL CHECK (cap_cents > 0),
  consumed_cents INTEGER NOT NULL DEFAULT 0 CHECK (consumed_cents >= 0),
  multiplier NUMERIC(6, 2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (consumed_cents <= cap_cents)
);

CREATE INDEX IF NOT EXISTS idx_matching_gifts_event ON public.matching_gifts(event_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_matching_gifts'
  ) THEN
    CREATE TRIGGER handle_updated_at_matching_gifts
      BEFORE UPDATE ON public.matching_gifts
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DROP INDEX IF EXISTS matching_gift_one_active_per_event;
CREATE UNIQUE INDEX matching_gift_one_active_per_event
  ON public.matching_gifts(event_id)
  WHERE (status = 'active');

-- 5) Team rollup from donation_requests via personal_campaigns.team_id
CREATE OR REPLACE FUNCTION public.update_team_total_from_donations()
RETURNS TRIGGER AS $$
DECLARE
  v_new_tid UUID;
  v_old_tid UUID;
  v_new_pc UUID := COALESCE(NEW.personal_campaign_id, NULL);
  v_old_pc UUID := COALESCE(OLD.personal_campaign_id, NULL);
  v_new_status TEXT := COALESCE(NEW.status, '');
  v_old_status TEXT := COALESCE(OLD.status, '');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF v_new_pc IS NOT NULL AND v_new_status = 'succeeded' THEN
      SELECT team_id INTO v_new_tid FROM public.personal_campaigns WHERE id = v_new_pc;
      IF v_new_tid IS NOT NULL THEN
        UPDATE public.teams
          SET total_raised_cents = total_raised_cents + NEW.amount_cents
          WHERE id = v_new_tid;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF v_new_pc IS DISTINCT FROM v_old_pc THEN
      IF v_old_pc IS NOT NULL AND v_old_status = 'succeeded' THEN
        SELECT team_id INTO v_old_tid FROM public.personal_campaigns WHERE id = v_old_pc;
        IF v_old_tid IS NOT NULL THEN
          UPDATE public.teams
            SET total_raised_cents = GREATEST(0, total_raised_cents - OLD.amount_cents)
            WHERE id = v_old_tid;
        END IF;
      END IF;
      IF v_new_pc IS NOT NULL AND v_new_status = 'succeeded' THEN
        SELECT team_id INTO v_new_tid FROM public.personal_campaigns WHERE id = v_new_pc;
        IF v_new_tid IS NOT NULL THEN
          UPDATE public.teams
            SET total_raised_cents = total_raised_cents + NEW.amount_cents
            WHERE id = v_new_tid;
        END IF;
      END IF;
      RETURN NEW;
    END IF;

    IF v_new_pc IS NOT NULL
       AND v_old_status <> 'succeeded'
       AND v_new_status = 'succeeded' THEN
      SELECT team_id INTO v_new_tid FROM public.personal_campaigns WHERE id = v_new_pc;
      IF v_new_tid IS NOT NULL THEN
        UPDATE public.teams
          SET total_raised_cents = total_raised_cents + NEW.amount_cents
          WHERE id = v_new_tid;
      END IF;
      RETURN NEW;
    END IF;

    IF v_old_pc IS NOT NULL
       AND v_old_status = 'succeeded'
       AND v_new_status <> 'succeeded' THEN
      SELECT team_id INTO v_old_tid FROM public.personal_campaigns WHERE id = v_old_pc;
      IF v_old_tid IS NOT NULL THEN
        UPDATE public.teams
          SET total_raised_cents = GREATEST(0, total_raised_cents - OLD.amount_cents)
          WHERE id = v_old_tid;
      END IF;
      RETURN NEW;
    END IF;

    IF v_new_pc IS NOT NULL
       AND v_new_status = 'succeeded'
       AND OLD.amount_cents IS DISTINCT FROM NEW.amount_cents THEN
      SELECT team_id INTO v_new_tid FROM public.personal_campaigns WHERE id = v_new_pc;
      IF v_new_tid IS NOT NULL THEN
        UPDATE public.teams
          SET total_raised_cents = GREATEST(
            0,
            total_raised_cents - OLD.amount_cents + NEW.amount_cents
          )
          WHERE id = v_new_tid;
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_total_from_donations ON public.donation_requests;
CREATE TRIGGER trigger_update_team_total_from_donations
  AFTER INSERT OR UPDATE ON public.donation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_total_from_donations();

-- 6) Matching gift consumed_cents stays in sync with succeeded donation_requests (event-scoped)
CREATE OR REPLACE FUNCTION public.apply_matching_gift_from_donations()
RETURNS TRIGGER AS $$
DECLARE
  v_delta INTEGER;
  v_room INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.event_id IS NOT NULL AND NEW.status = 'succeeded' THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = mg.consumed_cents + LEAST(
        NEW.amount_cents,
        GREATEST(0, mg.cap_cents - mg.consumed_cents)
      )
      WHERE mg.event_id = NEW.event_id
        AND mg.status = 'active'
        AND mg.consumed_cents < mg.cap_cents;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF COALESCE(NEW.event_id, OLD.event_id) IS NULL THEN
      RETURN NEW;
    END IF;

    -- Status moved out of succeeded: reverse prior consumption for this row
    IF OLD.status = 'succeeded' AND NEW.status <> 'succeeded' AND OLD.event_id IS NOT NULL THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = GREATEST(
        0,
        mg.consumed_cents - LEAST(OLD.amount_cents, mg.consumed_cents)
      )
      WHERE mg.event_id = OLD.event_id AND mg.status = 'active';
      RETURN NEW;
    END IF;

    -- Status moved into succeeded
    IF OLD.status <> 'succeeded' AND NEW.status = 'succeeded' AND NEW.event_id IS NOT NULL THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = mg.consumed_cents + LEAST(
        NEW.amount_cents,
        GREATEST(0, mg.cap_cents - mg.consumed_cents)
      )
      WHERE mg.event_id = NEW.event_id
        AND mg.status = 'active'
        AND mg.consumed_cents < mg.cap_cents;
      RETURN NEW;
    END IF;

    -- Still succeeded, amount or event changed
    IF OLD.status = 'succeeded' AND NEW.status = 'succeeded' THEN
      IF OLD.event_id IS DISTINCT FROM NEW.event_id THEN
        IF OLD.event_id IS NOT NULL THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = GREATEST(
            0,
            mg.consumed_cents - LEAST(OLD.amount_cents, mg.consumed_cents)
          )
          WHERE mg.event_id = OLD.event_id AND mg.status = 'active';
        END IF;
        IF NEW.event_id IS NOT NULL THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = mg.consumed_cents + LEAST(
            NEW.amount_cents,
            GREATEST(0, mg.cap_cents - mg.consumed_cents)
          )
          WHERE mg.event_id = NEW.event_id
            AND mg.status = 'active'
            AND mg.consumed_cents < mg.cap_cents;
        END IF;
        RETURN NEW;
      END IF;

      IF NEW.event_id IS NOT NULL AND OLD.amount_cents IS DISTINCT FROM NEW.amount_cents THEN
        v_delta := NEW.amount_cents - OLD.amount_cents;
        IF v_delta > 0 THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = mg.consumed_cents + LEAST(
            v_delta,
            GREATEST(0, mg.cap_cents - mg.consumed_cents)
          )
          WHERE mg.event_id = NEW.event_id
            AND mg.status = 'active'
            AND mg.consumed_cents < mg.cap_cents;
        ELSIF v_delta < 0 THEN
          v_room := -v_delta;
          UPDATE public.matching_gifts mg
          SET consumed_cents = GREATEST(0, mg.consumed_cents - LEAST(v_room, mg.consumed_cents))
          WHERE mg.event_id = NEW.event_id AND mg.status = 'active';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_apply_matching_gift_from_donations ON public.donation_requests;
CREATE TRIGGER trigger_apply_matching_gift_from_donations
  AFTER INSERT OR UPDATE ON public.donation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_matching_gift_from_donations();

-- 7) Row-Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teams_select_published ON public.teams;
CREATE POLICY teams_select_published ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = teams.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

DROP POLICY IF EXISTS teams_insert_authenticated ON public.teams;
CREATE POLICY teams_insert_authenticated ON public.teams
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = teams.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

DROP POLICY IF EXISTS teams_update_creator ON public.teams;
CREATE POLICY teams_update_creator ON public.teams
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS teams_delete_creator ON public.teams;
CREATE POLICY teams_delete_creator ON public.teams
  FOR DELETE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS team_members_select ON public.team_members;
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.events e ON e.id = t.event_id
      WHERE t.id = team_members.team_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS team_members_insert_self ON public.team_members;
CREATE POLICY team_members_insert_self ON public.team_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.events e ON e.id = t.event_id
      WHERE t.id = team_members.team_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

DROP POLICY IF EXISTS team_members_delete_self ON public.team_members;
CREATE POLICY team_members_delete_self ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS matching_gifts_select_published ON public.matching_gifts;
CREATE POLICY matching_gifts_select_published ON public.matching_gifts
  FOR SELECT USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = matching_gifts.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );
