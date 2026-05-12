# Operational Readiness — Go-Live Gates

This is the master checklist that maps ADRs 0001–0015 onto concrete,
verifiable gates a release manager can walk before unlocking each Sprint
or before authorizing a live event. Every checklist item links back to the
ADR(s) that own the decision so the *why* is one click away.

> **How to use this doc.** Each section is a gate. Walk every checkbox in
> order; do **not** advance a Sprint or schedule a live event with any item
> red. Items are intentionally phrased as "DONE when …" so disagreement is
> rare in retro.

---

## 1. Foundation gate — pre-Sprint 1

Unlocks Sprint 1 scaffolding. Owners: Eng (primary), Ops (Twilio/SendGrid externals).

### 1.1 Supabase project capacity (ADR-0001, ADR-0002, ADR-0008)

- [ ] Plan tier is **Pro (no spend cap)** or higher — `Dashboard → Settings → Billing`.
- [ ] `Project Settings → Realtime` shows **Max concurrent connections ≥ 2,000** (target 2,500).
- [ ] `Project Settings → Realtime` shows **Max events per second ≥ 500**.
- [ ] **`pg_net` extension** is `enabled` — verify with:
  ```sql
  select extname, extversion from pg_extension where extname = 'pg_net';
  ```
- [ ] **`pg_cron` extension** is `enabled` (needed for the Sprint 4 lot-close sweep referenced in ADR-0006).

### 1.2 Database baseline (ADR-0001, ADR-0011)

- [ ] All `supabase/migrations/` files apply cleanly on a fresh database (`supabase db reset`).
- [ ] `personal_campaigns` and `donation_requests.personal_campaign_id` exist after migration `021`.
- [ ] RLS is enabled on **every** new table (no table from Epic 1 or 2 is RLS-off).
- [ ] All new monetary columns end in `_cents` and are `integer` typed.

### 1.3 Auth & roles (ADR-0010, ADR-0012)

- [ ] `service_role` key is stored only in Vercel server-scope env vars; **never** prefixed `NEXT_PUBLIC_`.
- [ ] `anon` key is the only Supabase key referenced from client code.
- [ ] `auth.users` is reachable from server routes; magic-link send works end-to-end on staging.

### 1.4 External-track items kicked off (long-lead, do not block Sprint 1)

- [x] **Twilio 10DLC** brand registered, A2P campaign submitted (initiated 2026-05-12). (ADR-0004; 2–4 week carrier approval window — `APPROVED/VERIFIED` status still pending.)
- [x] **SendGrid domain authentication** DNS records added on `eventraisehub.com` (initiated 2026-05-12). (ADR-0005; SendGrid "Domain verified" + first test send with `dkim=pass spf=pass` still pending.)
- [ ] **Supabase project capacity confirmation** (initiated 2026-05-12). Walk §1.1 checklist above — plan tier, Realtime caps, `pg_net`, replication-lag visibility — and tick each box as confirmed.
- [ ] **VAPID keypair** generated and stored as `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` in Vercel. (ADR-0003.)
- [ ] **PayPal** production app credentials provisioned in Vercel; Vault enabled on the account. (ADR-0006.)

### 1.5 Observability baseline (ADR-0014)

- [ ] Sentry project for `eventraisehub-web` exists with prod, preview, dev environments.
- [ ] PostHog project exists with EU/US region matching data-residency policy.
- [ ] Source-map upload working on Vercel preview builds.

**Gate is GREEN when:** every box in §1.1, §1.2, §1.3, and §1.5 is checked. §1.4 may stay yellow — those only block Sprint 5.

---

## 2. Sprint 1 exit gate — P2P route live

Unlocks Sprint 1.5 (donation-attribution wiring).

- [ ] Migration `021_p2p_personal_campaigns.sql` applied to staging.
- [ ] `npm run build` and `npm test` green on `main`.
- [ ] `app/p/[slug]/page.tsx` renders a seeded `active` slug; non-active slugs return 404.
- [ ] `Thermometer` fill verified in DevTools to use `bg-action-500`.
- [ ] Lighthouse mobile score ≥ 90 on `/p/[slug]` (perf + accessibility).
- [ ] RLS sanity check: `anon` user can `select` an `active` personal campaign and cannot `select` a `draft` one belonging to another user.

---

## 2a. Sprint 1.5 exit gate — donation attribution end-to-end

Unlocks Sprint 2 (teams + matching gifts).

- [ ] Migration `022_paypal_orders_personal_campaign.sql` applied to staging.
- [ ] PayPal sandbox flow: donate from `/p/[slug]` results in a `donation_requests` row with `personal_campaign_id` set and `status='succeeded'`.
- [ ] Migration 021 trigger fires: target `personal_campaigns.total_raised_cents` increments by exactly the donation `amount_cents`.
- [ ] Refund path: setting the donation `status` away from `'succeeded'` decrements `total_raised_cents` and never goes negative.
- [ ] Negative tests, all of which result in the donation succeeding against the *event only* (no attribution, no crash):
  - Invalid UUID in `personalCampaignId`.
  - Valid UUID that no longer exists.
  - Personal campaign exists but `status != 'active'`.
  - Personal campaign exists but belongs to a different `event_id`.
- [ ] `FundraiserAttributionBanner` renders with the campaign owner's display name when arriving from a valid `/p/[slug]?…` link; does not render when the param is absent or invalid.
- [ ] Idempotency: two PayPal create-order calls with the same `(eventId, amount, pcid)` reuse the same `Idempotency-Key`; calls with different `pcid` produce distinct keys (ADR-0009).

## 3. Sprint 2 exit gate — teams + matching gifts

Unlocks Sprint 3 (auction code).

- [ ] Migrations `022_p2p_teams_matching.sql` applied.
- [ ] Donation-finalize hook updates `event.total_raised`, `personal_campaign.total_raised_cents`, and `team.total_raised_cents` **atomically** (single transaction or reconciled trigger).
- [ ] Matching-gift cap exhaustion test green (cannot double-spend a matching pool).
- [ ] Refund correctly reverses team + personal + event totals.
- [ ] Leaderboard endpoint returns < 200 ms p95 on 1,000-donor seed data.

---

## 4. Sprint 3 / Sprint 4 exit gate — auctions live (no notifications yet)

Unlocks Sprint 5 (notifications + GA polish).

### 4.1 Bid integrity (ADR-0007, ADR-0009, ADR-0011)

- [ ] Server-side bid validator rejects bids below `current_high_cents + min_increment_cents`.
- [ ] Idempotency key contract enforced: same `(user_id, lot_id, idempotency_key)` returns the original outcome.
- [ ] Anti-snipe extension fires when a bid lands inside the configurable window (default 120 s).
- [ ] Concurrent-bid stress test: 50 simultaneous bidders on one lot, no double-accepts.

### 4.2 Payment lifecycle (ADR-0006)

- [ ] PayPal Vault stores a payment method at registration time.
- [ ] Auction close triggers capture only for the winning bid.
- [ ] Capture failure path: lot moves to `capture_failed`, organizer notified, second-highest bid offered the slot.
- [ ] Vercel Cron sweep runs every minute during a live window; `closes_at` accuracy ≤ 60 s.

### 4.3 Organizer console

- [ ] GMV per lot, sell-through, and platform fees visible per auction.
- [ ] CSV export of winning bids is available.

---

## 5. Sprint 5 GA gate — notifications + live auctions

This is the **first booked-gala go-live gate**. All boxes must be green.

### 5.1 Channels operational (ADR-0003, ADR-0004, ADR-0005)

- [ ] **Web Push** (VAPID) — subscription persisted in `push_subscriptions`; test push reaches Chrome, Firefox, Safari (macOS + iOS 16.4+).
- [ ] **SMS** — Twilio 10DLC campaign **approved**; messaging service active; STOP/HELP keywords routed; opt-out persisted in `notification_preferences`.
- [ ] **Email** — SendGrid domain auth **verified**; bounce + spam handlers writing to `notification_deliveries`; DMARC at `p=quarantine` or stricter.
- [ ] **In-app** — toast and `public.notifications` row both fire from a single dispatcher call.

### 5.2 Fan-out correctness (ADR-0008, ADR-0009)

- [ ] `supabase/functions/notify-outbid` deployed.
- [ ] `pg_net` trigger on `public.bids` invokes the Edge Function with service-role auth header.
- [ ] `dedupe_key = "outbid:{lot_id}:{user_id}:{bid_seq}"` enforces single delivery per channel per outbid event.
- [ ] Replay test: deleting and reinserting a delivery row does **not** double-send.

### 5.3 SLOs measurable (ADR-0014)

PostHog dashboard `Auction Notifications` exists and shows:

- [ ] **Bid commit → bid broadcast** p95 ≤ 1 s.
- [ ] **Bid commit → push notification rendered** p95 ≤ 2 s.
- [ ] **Bid commit → SMS delivered** p95 ≤ 5 s (best-effort).
- [ ] **Bid commit → email queued** p95 ≤ 10 s.
- [ ] Sentry alert routes `outbid_delivery_failed` to PagerDuty (or equivalent).

### 5.4 Realtime headroom under load (ADR-0002, ADR-0012)

- [ ] k6 load test at **1.5×** the booked event's expected concurrent connections runs for 10 min with:
  - Zero `tenant_concurrent_connections_rate_limit` errors.
  - Zero `tenant_events_per_second_rate_limit` errors.
  - Zero `too_many_joins` errors.
- [ ] `Broadcast from DB Replication Lag` report shows p95 ≤ 2 s during the load test.
- [ ] Sanitized broadcast payloads contain **no** `bidder_id`, email, or phone (manual inspection in the Realtime Logs).

### 5.5 Brand + accessibility (ADR-0013)

- [ ] Visual audit: every new page uses only `trust-*` and `action-*` tokens (no `blue-`, `indigo-`, `purple-`, `cyan-`, `green-` in new TSX since Sprint 0).
- [ ] Thermometer fill is `bg-action-500` on `/p/[slug]`, `/events/[id]`, every leaderboard view, and every auction-progress widget.
- [ ] Donate / Bid CTAs are the only `action-*` buttons on the page (CTA scarcity preserved).
- [ ] axe-core scan returns zero serious or critical violations on the bid sheet and donate flow.

---

## 6. Per-event runbook

Run this **the day before** and the **hour before** every booked live auction. The day-before run identifies fixable issues; the hour-before run is a smoke test only.

### T-24 hours

- [ ] Sprint 5 gate (§5) still green for the production project.
- [ ] Event row is `published`; all lots are `draft` or `scheduled` with non-null `opens_at` and `closes_at`.
- [ ] Reserve prices and minimum increments are set on every lot.
- [ ] PayPal account on the platform has not gone into "limited" status; test capture of $1 sandbox transaction succeeds.
- [ ] Twilio account balance ≥ projected SMS volume × 3 (rough headroom for retries).
- [ ] SendGrid daily-send quota ≥ projected email volume × 3.
- [ ] On-call rotation set; PagerDuty / Slack alert routes verified with a synthetic test.

### T-1 hour

- [ ] Synthetic bid on a hidden test lot completes within SLO (bid → push under 2 s).
- [ ] Realtime Reports shows < 25% of "Max concurrent connections" — headroom available.
- [ ] No active Sentry alert.
- [ ] No active Supabase status-page incident.

### During the event

- [ ] One engineer is watching `Project Settings → Product Reports → Realtime` (Connected Clients + Rate of Channel Joins).
- [ ] One engineer is watching the Sentry feed + Vercel logs.
- [ ] Organizer console is open for the auction admin; manual lot-close authority is theirs.

### T+1 hour after close

- [ ] All winning bids captured (or moved to `capture_failed` with the organizer notified).
- [ ] Final GMV reconciles with the sum of captured payments.
- [ ] Post-event report queued for the organizer (email + dashboard).

---

## 7. Decommission / rollback playbook

Keep at hand in case a Sprint or event has to be aborted.

- [ ] **Disable notifications globally**: set `NOTIFICATIONS_KILL_SWITCH=true` in Vercel — dispatcher short-circuits with `status='killed'` (ADR-0008).
- [ ] **Pause new bids on a lot**: organizer console "Pause" button sets `lots.status='paused'`; bid API rejects with `403`.
- [ ] **Roll back a migration**: write a `down` migration as the next number; do **not** edit applied migrations (ADR-0001).
- [ ] **Mark an ADR superseded**: file a new ADR and update the index in `docs/adrs/README.md`; do not edit the original (see README "How to propose a new ADR").

---

## Ownership

| Gate | Primary owner | Secondary |
|------|---------------|-----------|
| §1 Foundation | Eng lead | Ops |
| §2 Sprint 1 exit | Eng lead | QA |
| §3 Sprint 2 exit | Eng lead | QA |
| §4 Sprint 3/4 exit | Eng lead | Finance (payments) |
| §5 GA gate | Eng lead | Ops + Finance |
| §6 Per-event | On-call eng | Event organizer |
| §7 Rollback | On-call eng | Eng lead |

This document is **living** — bump it whenever a new ADR adds a gate, and reference it from the Sprint exit criteria in `docs/sprint-plan.md`.
