-- Migration 032: Platform admin console (separate from phone-only user auth)
-- Super admins can invite additional admins; login uses email + phone OTP at /admin/login

CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  display_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT platform_admins_email_unique UNIQUE (email),
  CONSTRAINT platform_admins_phone_unique UNIQUE (phone_e164)
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_user ON public.platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_active ON public.platform_admins(is_active) WHERE is_active = true;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_platform_admins'
  ) THEN
    CREATE TRIGGER handle_updated_at_platform_admins
      BEFORE UPDATE ON public.platform_admins
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- No direct client access; APIs use service role
DROP POLICY IF EXISTS platform_admins_deny_all ON public.platform_admins;
CREATE POLICY platform_admins_deny_all ON public.platform_admins
  FOR ALL USING (false);

-- Bootstrap super admin (change via Super Admin → Admins after first login)
INSERT INTO public.platform_admins (email, phone_e164, role, display_name, is_active)
VALUES (
  'raoc@onthemarc.net',
  '+15079931292',
  'super_admin',
  'Platform Super Admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  phone_e164 = EXCLUDED.phone_e164,
  role = 'super_admin',
  is_active = true,
  updated_at = now();
