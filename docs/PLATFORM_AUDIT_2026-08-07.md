# Platform Audit — EventRaise (2026-08-07)

**Scope:** Full-platform security, payments, authz, RLS, and operational posture for EventRaise (Next.js 14 + Supabase + PayPal).  
**Branch remediations:** Critical and selected High findings patched in the same change set; remaining items tracked below.  
**Apply DB migration:** `supabase/migrations/033_security_hardening.sql` must be applied to production/staging for trigger + RLS fixes to take effect.

---

## Executive summary

EventRaise is a fundraising platform with guest donations, ticketing, P2P campaigns, auctions (PayPal Vault), organizer cashouts, and a platform-admin console. The audit reviewed **73 API routes**, auth helpers, PayPal/Braintree stubs, Supabase migrations/RLS, and ops surfaces.

**Overall risk before remediations: Critical.**  
The highest-impact issues were privilege escalation to platform admin via `profiles.role`, client-controlled ticket pricing, unpaid confirmed tickets, and organizers self-marking payouts completed.

Several Critical/High issues are **fixed in code** in this PR. Remaining High/Medium items need follow-up (durable rate limits, capture idempotency, auction registration token binding, shared admin password model).

| Severity | Found | Fixed this PR | Remaining |
|----------|------:|--------------:|----------:|
| Critical | 5 | 5 | 0 |
| High | 8 | 4 | 4 |
| Medium | 9 | 2 | 7 |
| Low / Info | 10+ | — | tracked |

---

## Architecture snapshot

| Layer | Notes |
|-------|--------|
| App | Next.js App Router under `app/` — marketing, dashboard, organizer, admin console, auctions, P2P |
| API | ~73 `route.ts` handlers; **no `middleware.ts`** (no global edge auth/CSRF) |
| Auth | Supabase Auth (cookie + Bearer); phone OTP (Twilio Verify); platform admin roster + shared password |
| DB | Supabase Postgres + RLS; heavy use of `supabaseAdmin` (service role) in APIs |
| Payments | **PayPal only** (ADR-0016). Braintree/Stripe routes sunset or legacy docs |
| Money | ADR-0011 integer cents — auctions/P2P largely compliant; donation fee math still float dollars |
| Observability | Sentry + PostHog present; admin audit best-effort |

---

## Critical findings (remediated)

### C1. Privilege escalation via `profiles.role` → platform admin
- **Was:** RLS allowed users to update their own profile with no column guard; `resolvePlatformAdminAccess` and event access treated `profiles.role === 'admin'` as admin.
- **Fix:** Removed profile-role trust from `lib/platform-admin.ts` and `lib/auth-utils.ts`. Event access now uses owner **or** `platform_admins` / owner allowlist. Migration `033` adds a trigger blocking role self-escalation.

### C2. Client-controlled ticket price on `/api/paypal/create-order`
- **Was:** Client `amount` used for `type: 'ticket'` without reading `event_tickets.price_cents`.
- **Fix:** Ticket orders load price from DB; client amount ignored. Donations capped at $50,000 and normalized via `lib/money/cents`.

### C3. Free confirmed tickets via public `/api/events/[id]/register`
- **Was:** Unauthenticated insert with `type: 'ticket'` and `status: 'confirmed'`.
- **Fix:** Endpoint is RSVP-only; ticket type returns 400 directing clients to paid checkout.

### C4. Organizer self-completing payouts
- **Was:** `update_payout_status` with `completed` allowed after `requireEventAccess`.
- **Fix:** Organizers limited to `requested`; `processing` / `completed` / `failed` / `cancelled` require platform admin.

### C5. Cashout ownership bypass when owner fields null
- **Was:** `if (ownerId && ownerId !== userId)` skipped when both IDs null.
- **Fix:** Require `ownerId` and exact match; otherwise 403.

---

## High findings

| ID | Status | Summary |
|----|--------|---------|
| H1 | **Fixed** | `/api/donations/share` — added rate limit, event publish check, message length cap |
| H2 | **Fixed (Sprint 6)** | Admin sessions cookie-only; Twilio OTP+password path when `PLATFORM_ADMIN_USE_TWILIO=true` (ADR-0018) |
| H3 | **Fixed (Sprint 6)** | Phone OTP no longer auto-mints platform-admin session |
| H4 | **Fixed** | Cashout null-owner bypass (see C5) |
| H5 | **Fixed** | Webhook verify no longer skips on `NODE_ENV=development` alone; needs `PAYPAL_WEBHOOK_SKIP_VERIFY=true` and non-production. Documented `PAYPAL_WEBHOOK_ID` in `env.example` |
| H6 | **Fixed (Sprint 6)** | `lib/rate-limit.ts` uses Upstash Redis REST when configured; memory fallback otherwise |
| H7 | **Fixed** | Admin preflight reduced to `{ ok, ready }` (no project ref / secret flags / admin counts) |
| H8 | **Fixed (Sprint 6)** | `middleware.ts` rate-limits auth/admin-auth/SMS share + security headers |

---

## Medium findings (selected)

| ID | Status | Summary |
|----|--------|---------|
| M1 | **Fixed** | Unpublished event IDOR on `GET /api/events/[id]` — drafts require owner/platform admin |
| M2 | **Fixed (Sprint 7)** | Capture amount reconciled vs stored order; mismatch rejected |
| M3 | **Fixed** | Ticket checkout called `createDonationOrder` with wrong arity (name→currency); now persists `paypal_orders` |
| M4 | Open | CORS credentials on `/api/*` tied to `NEXT_PUBLIC_APP_URL` — misconfig risk |
| M5 | Open | Advanced health endpoint exposes process/env fingerprinting |
| M6 | **Fixed (Sprint 7)** | Shared settle writer + unique `paypal_capture_id` indexes (migration 034) |
| M7 | Open | `personal_campaigns.total_raised_cents` client-editable — **DB trigger in 033** mitigates when applied |
| M8 | Open | Legacy `donations` / `paypal_orders` open INSERT — **RLS deny in 033** when applied |
| M9 | **Fixed (Sprint 7)** | Vault setup binding + reject client tokens; atomic `increment_event_ticket_sold` |

---

## Positive controls observed

- Service role key is not `NEXT_PUBLIC_*`
- Cron routes require `Bearer CRON_SECRET`
- Braintree routes return 410 (ADR-0016)
- Auction bid RPC uses row locks / increment rules / anti-snipe
- Platform-admins table has deny-all RLS; CRUD requires super admin
- Admin password compare uses `timingSafeEqual`
- Donor wall omits emails / user ids
- Debug/test/migration routes gated on production + admin

---

## Remediation checklist (ops)

1. **Apply migration 033** on Supabase (staging then production).
2. Set **`PAYPAL_WEBHOOK_ID`** in Vercel for all non-local environments; do **not** set `PAYPAL_WEBHOOK_SKIP_VERIFY` in production.
3. Audit existing `profiles.role = 'admin'` rows — revoke any that are not linked via `platform_admins` / owner allowlist.
4. Rotate `PLATFORM_ADMIN_PASSWORD` after deploy if previously exposed in logs/clients.
5. Prefer durable rate limiting (Upstash / Redis / Vercel KV) for auth, SMS, cashout, admin login.

---

## Recommended follow-ups (not in this PR)

See the sprint phase plan: [`docs/phase-audit-hardening.md`](./phase-audit-hardening.md) (P0 ops gate → Sprints 6–8).

1. Per-admin secrets or Twilio OTP for platform admin (retire shared password).
2. Unique constraints + conditional updates on donation/order capture ids; verify PayPal capture amount server-side.
3. Atomic ticket inventory (`quantity_sold` via SQL `WHERE quantity_sold + n <= quantity_total`).
4. Add Next.js middleware for security headers consistency, bot abuse, and auth-adjacent rate limits.
5. Migrate remaining PayPal fee math to integer cents (`lib/money`).
6. Harden `/api/health/advanced` and stub AI/insights endpoints.
7. Expand automated tests for authz on create-order, register, payouts, cashout.

---

## Surface inventory (API auth patterns)

| Pattern | Examples |
|---------|----------|
| Platform admin | `/api/admin/*`, `/api/payouts/*` |
| Event owner (+ platform admin) | analytics, registrations, payouts, tickets CRUD, publish |
| Authenticated | events CRUD, P2P, auction bid/register/vault, cashout |
| Cron Bearer | sweep-auction-lots, process-notification-deliveries |
| Webhook signature | `/api/paypal/webhook` |
| Public | donations create/capture, RSVP register, donor-wall, health, auth verify |

---

## Testing notes

- Unit tests under `__tests__/lib` cover money, auction rules, P2P, notifications — run `npm test` after install.
- No full e2e payment suite in CI against live PayPal; use sandbox rehearsal scripts (`paypal:rehearsal`).
- After migration 033, manually verify: (1) client cannot update `profiles.role`, (2) ticket create-order ignores underpayment, (3) register rejects `type=ticket`, (4) organizer cannot set payout `completed`.
