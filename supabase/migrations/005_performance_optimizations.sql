-- Performance Optimizations and Safety Constraints
-- This migration is additive-only (no breaking drops) and focuses on:
-- - Indexes for common filters/joins and RLS policy predicates
-- - Unique safeguards on external IDs
-- - Consistent updated_at triggers for newer tables

-- 1) Indexes to support RLS and common queries
-- Donations often filtered by donor_email and created_at
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON public.donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at);

-- Ensure quick lookup by payment_intent_id (also add partial unique below)
CREATE INDEX IF NOT EXISTS idx_donations_payment_intent_id ON public.donations(payment_intent_id);

-- Campaigns composite by organization and status
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON public.campaigns(organization_id, status);

-- Events commonly filtered by dates and organization
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_org_created ON public.events(organization_id, created_at);

-- Volunteer signups filtered by volunteer_email in policies
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_volunteer_email ON public.volunteer_signups(volunteer_email);

-- Event participants filtered by participant_email in policies
CREATE INDEX IF NOT EXISTS idx_event_participants_email ON public.event_participants(participant_email);

-- 2) Newer events/registration schema indexes (from 004) for frequent queries
-- Guard schema/table names with IF EXISTS to avoid failures if not present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'event_registrations'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_event_reg_created_at ON public.event_registrations(registration_date)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_event_reg_event_status ON public.event_registrations(event_id, status)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_event_reg_checkout_session ON public.event_registrations(checkout_session_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'volunteer_signups'
  ) THEN
    -- Handle schema variants: older (opportunity_id) vs newer (shift_id)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'volunteer_signups' AND column_name = 'shift_id'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vol_signup_shift_status ON public.volunteer_signups(shift_id, status)';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'volunteer_signups' AND column_name = 'opportunity_id'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vol_signup_opportunity_status ON public.volunteer_signups(opportunity_id, status)';
    END IF;
  END IF;
END $$;

-- 3) Safeguards: prevent duplicate payments by external IDs
-- Use a partial unique index to allow multiple NULLs
CREATE UNIQUE INDEX IF NOT EXISTS uq_donations_payment_intent_unique
ON public.donations(payment_intent_id)
WHERE payment_intent_id IS NOT NULL;

-- 4) Ensure updated_at triggers exist on newer tables introduced in 004
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'handle_updated_at_events'
    ) THEN
      EXECUTE 'CREATE TRIGGER handle_updated_at_events
               BEFORE UPDATE ON public.events
               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'event_registrations'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'handle_updated_at_event_registrations'
    ) THEN
      EXECUTE 'CREATE TRIGGER handle_updated_at_event_registrations
               BEFORE UPDATE ON public.event_registrations
               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'volunteer_shifts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'handle_updated_at_volunteer_shifts'
    ) THEN
      EXECUTE 'CREATE TRIGGER handle_updated_at_volunteer_shifts
               BEFORE UPDATE ON public.volunteer_shifts
               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'volunteer_signups'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'handle_updated_at_volunteer_signups_new'
    ) THEN
      EXECUTE 'CREATE TRIGGER handle_updated_at_volunteer_signups_new
               BEFORE UPDATE ON public.volunteer_signups
               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'event_tickets'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'handle_updated_at_event_tickets'
    ) THEN
      EXECUTE 'CREATE TRIGGER handle_updated_at_event_tickets
               BEFORE UPDATE ON public.event_tickets
               FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()';
    END IF;
  END IF;
END $$;

-- 5) Optional: narrow text columns with CHECKs for email formats (non-breaking)
-- Keep minimal to avoid false rejections; index supports lookup already
-- Example (commented):
-- ALTER TABLE public.donations
--   ADD CONSTRAINT donations_email_format_chk
--   CHECK (donor_email IS NULL OR position('@' in donor_email) > 1);


