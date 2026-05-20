# ADR-0017: Twilio Verify for phone-only authentication

- **Status:** Accepted
- **Date:** 2026-05-20
- **Owners:** Engineering
- **Related:** ADR-0004, ADR-0010
- **Supersedes:** Email/password + magic-link as the default organizer sign-in (ADR-0010 operational note)

## Context

Sprint 0.3a requires a single vendor for identity proof at sign-in. Email/password plus optional CAPTCHA created operational friction (see `LEDGER.md`). Twilio Verify provides OTP delivery, rate limiting, and fraud signals without routing auth SMS through Supabase’s built-in phone provider.

## Decision

- **Sign-in and registration** use **Twilio Verify v2** only:
  - `POST /api/auth/verify/send` → `Verifications` (SMS channel)
  - `POST /api/auth/verify/check` → `VerificationCheck`; on `approved`, the server creates or updates a Supabase Auth user and returns a session via `generateLink` + `verifyOtp` (service role).
- Phone numbers are stored in **E.164**; synthetic email `p{digits}@phone.eventraisehub.internal` is used only for Supabase session issuance.
- UI: `/auth/login` and `/auth/register` are phone + OTP only (no password, no email confirmation).
- Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.

## Alternatives considered

- **Supabase Phone Auth with Twilio as SMS transport.** Rejected for this sprint: couples auth to Supabase’s OTP template and does not use Verify’s check API/fraud tooling explicitly.
- **Email magic link.** Rejected as primary auth per product direction.

## Consequences

- Positive: one OTP vendor; aligns with Twilio SMS for notifications (ADR-0004).
- Negative: US-first normalization in v1; international E.164 can be enabled later.
- Operational: create a Verify Service in Twilio Console; add secrets to Vercel and `.env.local`.

## Compliance / acceptance criteria

- No `@sendgrid/mail` imports in application code.
- Unauthenticated users cannot obtain a session without an approved Verify check.
- Rate limits on send/check API routes (per client key).
