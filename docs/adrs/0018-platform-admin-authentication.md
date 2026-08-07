# ADR-0018: Platform admin authentication and session delivery

- **Status:** Accepted
- **Date:** 2026-08-07
- **Owners:** Engineering, Security
- **Related:** ADR-0010, ADR-0017, docs/phase-audit-hardening.md (Sprint 6), docs/PLATFORM_AUDIT_2026-08-07.md (H2, H3, H6, H8)

## Context

Platform console access previously trusted (1) a shared `PLATFORM_ADMIN_PASSWORD`, (2) optional elevation when a roster phone completed organizer Twilio Verify, and (3) returning `access_token` + `refresh_token` in JSON bodies. Audit findings H2/H3 required separating organizer phone auth from platform admin and reducing token theft via XSS.

## Decision

1. **Organizer phone OTP never grants platform admin.** `/api/auth/verify/check` always creates a normal phone-user session. Roster phones may set `platform_admin_console_available` as a UX hint only.
2. **Platform admin entry is `/admin/login` only** (or `/api/admin/auth/*` when Twilio mode is on).
3. **Static mode (default):** email + phone must match `platform_admins` **and** `PLATFORM_ADMIN_PASSWORD`.
4. **Twilio mode (`PLATFORM_ADMIN_USE_TWILIO=true`):** OTP send/check on roster phone **plus** password second factor before minting an admin session.
5. **Sessions are delivered via httpOnly cookies only.** API responses must not include `refresh_token` (or raw access tokens) in JSON.
6. **Durable rate limiting** uses Upstash Redis REST when configured; otherwise in-memory fallback. Middleware rate-limits `/api/auth/*`, `/api/admin/auth/*`, and `/api/donations/share`.

## Alternatives considered

- Auto-elevate roster phones after organizer OTP — rejected (SIM-swap → full admin).
- Return tokens in JSON for client `setSession` — rejected (XSS refresh-token theft).
- Passwordless admin OTP alone — rejected as sole factor; password remains required in Twilio mode.

## Consequences

- Positive: SIM-swap on an admin’s phone does not open the console without password; tokens not exposed to page JS.
- Negative: Admins must use `/admin/login` even if they already phone-verified as organizers.
- Operational: Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for multi-instance rate limits; optionally enable `PLATFORM_ADMIN_USE_TWILIO=true` after OTP UI is used.

## Compliance / acceptance criteria

- Phone verify check never calls `createSessionForPlatformAdmin`.
- Admin login/check responses contain no `refresh_token` field.
- `middleware.ts` matches auth and SMS-share API paths.
- `npm test` covers rate-limit memory path and documents no-elevation rule.
