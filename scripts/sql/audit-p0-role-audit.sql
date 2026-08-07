-- Audit P0.4 — profiles.role = admin vs platform_admins / allowlist
-- Paste into Supabase SQL editor. Revoke orphans manually after review.

SELECT
  p.id AS profile_id,
  p.email AS profile_email,
  p.role,
  pa.id AS platform_admin_id,
  pa.email AS roster_email,
  pa.user_id AS roster_user_id,
  pa.is_active AS roster_active,
  CASE
    WHEN pa.id IS NOT NULL AND pa.is_active THEN 'ok_roster'
    ELSE 'review_orphan_or_owner_allowlist'
  END AS disposition
FROM public.profiles p
LEFT JOIN public.platform_admins pa
  ON pa.is_active = true
 AND (
   lower(pa.email) = lower(p.email)
   OR pa.user_id = p.id
 )
WHERE p.role = 'admin'
ORDER BY disposition, p.email;

-- Example revoke (only after confirming not a real platform admin):
-- UPDATE public.profiles SET role = 'user' WHERE id = '<uuid>';
