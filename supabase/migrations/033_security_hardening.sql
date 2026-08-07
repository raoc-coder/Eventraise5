-- Migration 033: Security hardening from platform audit (2026-08-07)
-- Blocks profile role self-escalation, protects P2P raised totals,
-- and tightens overly permissive INSERT policies on finance tables.

-- ---------------------------------------------------------------------------
-- 1) Prevent authenticated users from changing profiles.role
--    Service role (API / ensureProfileAdminRole) bypasses RLS and still can
--    update; this trigger rejects role changes under the authenticated JWT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF coalesce(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Changing profile role is not allowed'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.role IS NOT NULL AND NEW.role IS DISTINCT FROM 'user' THEN
    IF coalesce(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
      NEW.role := 'user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_self_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

-- ---------------------------------------------------------------------------
-- 2) Protect personal_campaigns.total_raised_cents from client edits
--    Rollups must come from donation triggers / service role only.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_personal_campaign_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.total_raised_cents IS DISTINCT FROM OLD.total_raised_cents THEN
    IF coalesce(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
      NEW.total_raised_cents := OLD.total_raised_cents;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_personal_campaign_totals ON public.personal_campaigns;
CREATE TRIGGER trg_protect_personal_campaign_totals
  BEFORE UPDATE ON public.personal_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_personal_campaign_totals();

-- ---------------------------------------------------------------------------
-- 3) Tighten paypal_orders INSERT — service role only (APIs use admin client)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can create PayPal orders" ON public.paypal_orders;
DROP POLICY IF EXISTS paypal_orders_insert_service ON public.paypal_orders;
CREATE POLICY paypal_orders_insert_deny_clients ON public.paypal_orders
  FOR INSERT
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 4) Tighten legacy donations open write policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can update donations" ON public.donations;
DROP POLICY IF EXISTS donations_insert_deny_clients ON public.donations;
DROP POLICY IF EXISTS donations_update_deny_clients ON public.donations;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'donations'
  ) THEN
    EXECUTE $p$
      CREATE POLICY donations_insert_deny_clients ON public.donations
        FOR INSERT WITH CHECK (false)
    $p$;
    EXECUTE $p$
      CREATE POLICY donations_update_deny_clients ON public.donations
        FOR UPDATE USING (false)
    $p$;
  END IF;
END $$;
