# Project Ledger

## Authentication — Twilio Verify (S0.3a)

- Date: 2026-05-20
- Decision: Phone OTP via **Twilio Verify** only; `/auth/login` and `/auth/register` no longer use email/password.
- Required env (Vercel + `.env.local`): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.
- Twilio Console: create a **Verify Service** (SMS channel enabled).
- Supabase: disable mandatory email confirmation for new phone users if testing sign-up; phone users use synthetic internal email for session issuance (see ADR-0017).
- Optional messaging env for donation-share SMS: `TWILIO_MESSAGING_SERVICE_SID` or `TWILIO_FROM_NUMBER`.

## Authentication — superseded (2026-04-15)

- Email/password + Supabase CAPTCHA workaround is **obsolete** after ADR-0017. Do not re-enable Turnstile unless adding bot protection on Verify send endpoints.

## Sprint 0 — VAPID (S0.6)

- Date: 2026-05-20
- Status: Keys generated; stored in `.env.local` and Vercel (user confirmed).
- Used for Web Push (ADR-0003), not for login.

## Sprint 0 — SendGrid removed (S0.4)

- Date: 2026-05-20
- `@sendgrid/mail` and `lib/sendgrid.ts` removed. Transactional email channel dropped; use Twilio SMS + Web Push + in-app per ADR-0017 / ADR-0004.
