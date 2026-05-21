# Sprint Phase Output — Internal Recap

**Document type:** Internal engineering & ops reference  
**Last updated:** 2026-05-20  
**Program:** Epics 1 (P2P) + 2 (Auctions & real-time bidding)  
**Authoritative plan:** [`docs/sprint-plan.md`](../sprint-plan.md)  
**Living status log:** [`LEDGER.md`](../../LEDGER.md) at repo root  
**Supabase project (linked):** `yxzypekwyuopbanroobr` — `https://yxzypekwyuopbanroobr.supabase.co`

This document summarizes **what each sprint phase produced** in the repository: schema, routes, libraries, tests, and operational follow-ups. Use it for onboarding, release notes, and gala readiness reviews.

---

## Program summary

| Phase | Theme | Engineering status | Primary ops gate |
|-------|--------|-------------------|------------------|
| **Sprint 0** | Foundations (ADRs, auth, VAPID, capacity) | **Complete** | 10DLC campaign **in process** (weeks) |
| **Sprint 0.7** | Braintree sunset → PayPal-only | **Complete** (2026-05-13) | — |
| **Sprint 1** | P2P public pages + thermometer | **Complete** | — |
| **Sprint 1.5** | Donation → personal campaign attribution | **Complete** | Sandbox attribution tests (OR §2a) |
| **Sprint 2** | Teams, matching gifts, fundraiser CRUD | **Complete** | Matching/refund rehearsal |
| **Sprint 3** | Auction vault, bids, capture-on-win | **Complete** | PayPal Vault enabled in sandbox; cron on Vercel |
| **Sprint 4** | Realtime bids, anti-snipe, outbid fan-out | **Complete** | Edge deploy + `pg_net` Vault secrets + 10DLC for SMS |
| **Sprint 5** | Polish (Realtime P2P, donor wall, a11y, load test) | **Complete** | k6 rehearsal + dashboard wiring per runbook |
| **Phase GA** | Go-live ops + first live event | **Active** (2026-05-21) | OR §5–§6; see [`phase-ga-go-live.md`](./phase-ga-go-live.md) |

**Bottom line:** Feature work for Epics 1–2 and Sprint 5 polish is **shipped in repo**. **Current phase:** Phase GA — production env, cron/outbid smoke, PayPal Vault E2E, 10DLC, per-event rehearsal ([`operational-readiness.md`](../adrs/operational-readiness.md)).

---

## Sprint 0 — Foundations

**Goal:** Lock architecture, phone auth, notification primitives env, Supabase capacity, remove SendGrid.

### Outputs

| ID | Deliverable | Output in repo / infra |
|----|-------------|----------------------|
| S0.1–S0.2 | ADR set + sprint plan | `docs/adrs/0001`–`0017`, `docs/sprint-plan.md` |
| S0.3a | Twilio Verify phone auth | ADR-0017; `/api/auth/verify/send`, `/api/auth/verify/check`; `/auth/login`, `/auth/register` rewritten |
| S0.3b | 10DLC Messaging | `lib/twilio-sms.ts`; env `TWILIO_MESSAGING_SERVICE_SID` — **carrier campaign not verified yet** |
| S0.4 | SendGrid removed | No `@sendgrid/mail`; notifications = push + SMS + in-app only |
| S0.5 | Supabase Pro | Pro confirmed; Realtime / `pg_net` capacity per OR §1 |
| S0.6 | VAPID | `npm run generate:vapid`; env `VAPID_*`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` |
| S0.7 | (see 0.7 below) | — |
| Deploy | Vercel production | Phone auth + VAPID env (2026-05-20) |

### Key environment variables

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_MESSAGING_SERVICE_SID`, `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`

### Exit

Engineering green. **10DLC** is the only long-lead external item; it blocks reliable US **bulk SMS** at gala scale, not Web Push or Verify login.

---

## Sprint 0.7 — Braintree sunset

**Goal:** PayPal-only payments (ADR-0016).

### Outputs

- Removed Braintree packages and `lib/braintree-*`, `app/api/braintree/**`
- Donations and tickets use PayPal paths only
- **Status:** Complete 2026-05-13

### Exit

No `braintree` imports; `npm run build` / `tsc` green.

---

## Sprint 1 — P2P foundations (US 1.1)

**Goal:** Public personal fundraising pages at `/p/[slug]`.

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S1.1 | Schema | `supabase/migrations/021_p2p_personal_campaigns.sql` — `personal_campaigns`, rollup trigger on `donation_requests` |
| S1.2 | Shared libs | `lib/money/cents.ts`, stubs for realtime/dispatcher (extended in S4+) |
| S1.3 | Public UI | `app/p/[slug]/page.tsx`, `components/p2p/Thermometer.tsx` (Action Orange fill, ADR-0013) |
| S1.4 | API stubs | `app/api/personal-campaigns/*` (later replaced S2) |
| S1.5 | Tests | `__tests__/components/p2p/Thermometer.test.ts`, cents tests |

### Exit

Seeded active slug renders; thermometer brand-correct; tests green.

---

## Sprint 1.5 — P2P donation attribution

**Goal:** PayPal donations credit `personal_campaigns.total_raised_cents`.

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S1.5.1 | Schema | `022_paypal_orders_personal_campaign.sql` |
| S1.5.2 | Wiring | `lib/p2p/personal-campaigns.ts`; PayPal create/capture; `FundraiserAttributionBanner`, `MatchingAmplifiedNote` on donate flow |

### Exit

Sandbox happy path: donate via `/p/[slug]` → rollup updates campaign total (OR §2a).

---

## Sprint 2 — Epic 1 completion (P2P gamification)

**Goal:** Authenticated fundraiser creation, teams, leaderboards, matching gifts.

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S2.1 | Fundraiser UI | `/events/[id]/fundraise` (create/edit `?edit=slug`), cover URL, team picker |
| S2.2 | APIs | `app/api/personal-campaigns` POST/PATCH/GET + idempotency |
| S2.4 | Schema | `023_p2p_teams_matching.sql` — `teams`, `team_members`, `matching_gifts` |
| S2.5 | Leaderboard API | `GET /api/events/[id]/leaderboard` |
| S2.6 | UI | `/events/[id]/teams`, `/events/[id]/leaderboard` (initially 10s poll; Realtime in S5) |
| S2.7 | Matching | `028_matching_gift_multiplier.sql`; `lib/p2p/matching-gifts.ts`; organizer `POST /api/events/[id]/matching-gifts` |
| S2.8 | Tests | `__tests__/lib/p2p/matching-gifts.test.ts`, `leaderboard.test.ts` |

### Migrations (apply order)

`023`, `028`

### Exit

Epic 1 P2P user stories satisfied in code; leaderboards polled until Sprint 5.

---

## Sprint 3 — Epic 2 kick-off (auctions)

**Goal:** Vault at registration, authoritative bids, capture on win, organizer console.

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S3.1 | Schema | `024_auctions.sql` — `auctions`, `auction_lots`, `bids`, `auction_registrations` |
| S3.2 | PayPal Vault | `lib/auction/paypal-vault.ts`; `/api/auctions/[id]/vault/setup`, `/vault/confirm`; register UI + practice vault (sandbox) |
| S3.3 | Capture | `lib/auction/settle-lot.ts`; `029_auction_capture_columns.sql` |
| S3.4 | Cron | `GET /api/cron/sweep-auction-lots` — close due lots + settle winners (`vercel.json` daily schedule) |
| S3.5 | Organizer | `/auctions/[id]/organizer`, `GET /api/auctions/[id]/export` (CSV) |
| S3.6–S3.8 | Bidding UI | `/auctions/[id]/lots/[lotId]` bid sheet; `POST .../bids` + idempotency; `lib/auction/bid-rules.ts` |
| S3.9 | Tests | `anti-snipe.test.ts`, `bid-rules.test.ts`, `settle-lot.test.ts` |

### Migrations

`024`, `029`

### Exit

Bidder can register, vault, bid from mobile; capture path exercised in sandbox. Anti-snipe + Realtime deferred to Sprint 4.

### Ops follow-up

- Enable **PayPal Vault** in PayPal developer app (sandbox + live)
- Confirm `CRON_SECRET` on Vercel for sweep cron

---

## Sprint 4 — Epic 2 completion (realtime + outbid)

**Goal:** Sub-second lot updates, anti-snipe, outbid notifications (push, SMS, in-app).

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S4.1 | Realtime lots | `026_auction_antisnipe_realtime.sql`; `lib/realtime/auctionChannel.ts`; lot page subscribes |
| S4.2 | Anti-snipe | `place_auction_bid` — 60s window → +120s extension (ADR-0007) |
| S4.4 | Notification schema | `025_notifications_realtime.sql` — `push_subscriptions`, `notification_preferences`, `notification_deliveries` |
| S4.5 | Enqueue | `027_notify_outbid_pg_net.sql`; `supabase/functions/notify-outbid` |
| S4.6 | Send path | `lib/notifications/send-delivery.ts`, `dispatcher-impl.ts`; cron `GET /api/cron/process-notification-deliveries` (5 min in `vercel.json`) |
| S4.7 | Web Push UX | `public/sw.js`, `POST /api/notifications/push-subscribe`, `OutbidPushPrompt` on lot page |
| S4.8 | Tests | `outbid-payload.test.ts`, `send-delivery.test.ts`, `vapid.test.ts` |
| S4.x | Delivery dedupe | `030_notification_deliveries_user_id.sql` — `user_id`, `sent_at`; no **email** channel in Edge |

### Notification flow (reference)

```
bid INSERT → pg_net → Edge notify-outbid → notification_deliveries (pending)
    → Vercel cron process-notification-deliveries → push | SMS | in_app
```

### Migrations

`025`, `026`, `027`, `030` — **applied** to `yxzypekwyuopbanroobr`

### Exit (engineering)

Enqueue → cron → channel send implemented. **GA** still requires ops checklist OR §5 (Edge deploy, Vault secrets, VAPID on Vercel, 10DLC for SMS).

### Ops checklist (Sprint 4)

1. `supabase functions deploy notify-outbid`
2. Vault secrets: `notify_outbid_edge_url`, `notify_outbid_service_role` (see `env.example` comments)
3. `CRON_SECRET` + all `VAPID_*` on Vercel
4. Manual drain test: `curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/process-notification-deliveries`

---

## Sprint 5 — Polish & hardening

**Goal:** Realtime P2P surfaces, donor wall, accessibility, load-test assets, observability runbook.

### Outputs

| ID | Deliverable | Location |
|----|-------------|----------|
| S5.1 | Live leaderboards | `lib/realtime/leaderboardChannel.ts`; `/events/[id]/leaderboard` Realtime + 60s fallback |
| S5.2 | Thermometer polish | `celebrateOnIncrease` on `Thermometer`; `components/p2p/LiveThermometer.tsx` on `/p/[slug]` |
| S5.3 | Donor wall | `031_sprint5_realtime_p2p_donor_wall.sql` — `donor_wall_feed`; `GET /api/donor-wall`; `components/engagement/DonorWall.tsx` on published events |
| S5.4 | Accessibility | `aria-live` / labels on bid sheet, donate form, leaderboard |
| S5.5 | Load tests | `scripts/load-test/k6-leaderboard.js`, `k6-auction-bids.js`, `README.md` |
| S5.6 | Runbook | `docs/runbooks/sprint5-observability.md` |

### Migrations

`031` — **applied** to `yxzypekwyuopbanroobr`

### Exit

Code complete; rehearse k6 + per-event checklist in runbook before first booked gala.

---

## Schema index (Epic 1–2 + polish)

Migrations introduced for the locked sprint plan (apply in filename order on fresh DB; production uses `supabase db push --include-all`):

| Migration | Sprint | Summary |
|-----------|--------|---------|
| `021_p2p_personal_campaigns.sql` | 1 | Personal campaigns + donation rollup |
| `022_paypal_orders_personal_campaign.sql` | 1.5 | PayPal order ↔ campaign attribution |
| `023_p2p_teams_matching.sql` | 2 | Teams, matching gifts, team rollups |
| `028_matching_gift_multiplier.sql` | 2 | Matching multiplier in DB trigger |
| `024_auctions.sql` | 3 | Auctions, lots, bids, registrations |
| `029_auction_capture_columns.sql` | 3 | PayPal capture ids on lots |
| `025_notifications_realtime.sql` | 4 | Push prefs, delivery queue |
| `026_auction_antisnipe_realtime.sql` | 4 | Anti-snipe RPC + Realtime on `auction_lots` |
| `027_notify_outbid_pg_net.sql` | 4 | `pg_net` trigger → Edge |
| `030_notification_deliveries_user_id.sql` | 4 | `user_id` on deliveries |
| `031_sprint5_realtime_p2p_donor_wall.sql` | 5 | Realtime P2P tables + `donor_wall_feed` |

---

## API & route index (by domain)

### P2P

- `GET /api/events/[id]/leaderboard`
- `GET|POST /api/events/[id]/teams`, matching-gifts POST
- `GET|POST|PATCH /api/personal-campaigns`
- `GET /api/donor-wall?eventId=`
- Pages: `/p/[slug]`, `/events/[id]/fundraise`, `/events/[id]/leaderboard`, `/events/[id]/teams`

### Auctions

- `POST /api/auctions/[id]/lots/[lotId]/bids` (Idempotency-Key required)
- Vault: `/api/auctions/[id]/vault/setup`, `/vault/confirm`
- `GET /api/auctions/[id]/export`
- Pages: `/auctions/[id]`, `/lots/[lotId]`, `/organizer`, register flow

### Notifications & cron

- `POST /api/notifications/push-subscribe`
- `GET /api/cron/sweep-auction-lots` (daily)
- `GET /api/cron/process-notification-deliveries` (every 5 min on Pro)
- Edge: `supabase/functions/notify-outbid`

### Auth

- `POST /api/auth/verify/send`, `/check`
- Pages: `/auth/login`, `/auth/register` (phone OTP)

---

## Realtime channels (client helpers)

| Channel helper | Table(s) | Used on |
|----------------|----------|---------|
| `subscribeToAuctionLot` | `auction_lots` UPDATE | Lot bid page |
| `subscribeToEventLeaderboard` | `personal_campaigns`, `teams` | Leaderboard page |
| `subscribeToDonorWall` | `donor_wall_feed` INSERT | Event donor wall |
| LiveThermometer (inline) | `personal_campaigns` UPDATE | `/p/[slug]` |

All payloads follow ADR-0012 (no bidder email/PII on auction channels; donor wall feed has display name only).

---

## Test coverage (sprint-owned)

| Area | Path |
|------|------|
| Money / cents | `__tests__/lib/money/cents.test.ts` |
| Thermometer / brand | `__tests__/components/p2p/Thermometer.test.ts` |
| P2P matching / leaderboard | `__tests__/lib/p2p/matching-gifts.test.ts`, `leaderboard.test.ts` |
| Auction rules / settle | `__tests__/lib/auction/bid-rules.test.ts`, `anti-snipe.test.ts`, `settle-lot.test.ts` |
| Notifications | `__tests__/lib/notifications/vapid.test.ts`, `outbid-payload.test.ts`, `send-delivery.test.ts` |

Run: `npm run validate` (lint + type-check + `test:ci`).

---

## Open ops backlog (post–Sprint 5)

| Priority | Item | Owner | Blocks |
|----------|------|-------|--------|
| P0 | Twilio 10DLC campaign **VERIFIED** | Ops | Reliable US outbid SMS |
| P0 | Deploy Edge `notify-outbid` + Vault `pg_net` secrets | Eng/Ops | Outbid enqueue from bids |
| P1 | `CRON_SECRET` in `.env.local` + Vercel (all cron routes) | Eng | Manual/automated delivery drain |
| P1 | PayPal Vault enabled (sandbox → live) | Eng/Finance | Winner capture |
| P2 | k6 leaderboard @ 5k VUs; document p95 in runbook | Eng | Capacity sign-off (OR §6) |
| P2 | Wire Sentry/Vercel panels per `sprint5-observability.md` | Eng | SLO alerting (ADR-0014) |

---

## Related documents

- [`docs/sprint-plan.md`](../sprint-plan.md) — locked deliverable checklist  
- [`LEDGER.md`](../../LEDGER.md) — dated status and external-track log  
- [`docs/adrs/operational-readiness.md`](../adrs/operational-readiness.md) — gala GA gates by section  
- [`docs/runbooks/sprint5-observability.md`](../runbooks/sprint5-observability.md) — alerts + load test rehearsal  
- [`env.example`](../../env.example) — required environment variables  
- [`scripts/load-test/README.md`](../../scripts/load-test/README.md) — k6 usage  

---

## Document maintenance

Update this recap when:

1. A new sprint phase ships material scope (new migration band, epic, or GA gate).
2. Supabase project ref or production URL changes.
3. A previously “in process” external item (e.g. 10DLC) reaches **Verified**.

For day-to-day status, prefer **`LEDGER.md`**; for acceptance criteria, prefer **`operational-readiness.md`**.
