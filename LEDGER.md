# Project Ledger

## Authentication Operations

- Date: 2026-04-15
- Context: Login and registration can fail with CAPTCHA errors when Supabase bot detection is enabled but no CAPTCHA provider is configured.
- Immediate workaround: Disable CAPTCHA/Bot Detection in Supabase Auth security settings.
- Future hardening task:
  - Set up Cloudflare Turnstile.
  - Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in app environment.
  - Configure Turnstile secret key in Supabase Auth CAPTCHA settings.
  - Re-enable CAPTCHA/Bot Detection in Supabase.
  - Validate both `/auth/login` and `/auth/register` in production after re-enable.
