# Project Ledger

**Internal sprint outputs (full recap):** [`docs/internal/sprint-phase-recap.md`](docs/internal/sprint-phase-recap.md) · **Phase GA sprint (2026-05-21):** [`docs/internal/phase-ga-engineering-sprint-2026-05-21.md`](docs/internal/phase-ga-engineering-sprint-2026-05-21.md)

## Sprint 0 — status (2026-05-20)

| Item | Status | Notes |
|------|--------|--------|
| S0.1–S0.2 ADRs + sprint plan | **Complete** | Locked baseline |
| S0.3a Twilio Verify auth | **Complete** | ADR-0017; phone OTP on `/auth/login`, `/auth/register`; env on Vercel |
| S0.3b Twilio 10DLC campaign verification | **Complete** | Campaign **VERIFIED** + brand **APPROVED** (2026-06-07) |
| S0.4 SendGrid removed | **Complete** | No `@sendgrid/mail`; push + SMS + in-app only |
| S0.5 Supabase Pro | **Complete** | Pro confirmed; capacity gate satisfied for feature work |
| S0.6 VAPID | **Complete** | Keys in `.env.local` + Vercel |
| S0.7 Braintree sunset | **Complete** | 2026-05-13 |
| Vercel deployment | **Complete** | Production deploy successful (2026-05-20); **PayPal live** env + redeploy (2026-06-07) |

**Sprint 0 exit:** Green — including 10DLC campaign verification (2026-06-07).

## Sprint 2 — Epic 1 P2P (2026-05-20)

- Status: **Shipped in repo** — edit fundraiser (`?edit=slug`), team create UI, leaderboard page, matching multiplier migration `028`, organizer matching-gift POST, donation amplified note.
- Apply migration `028_matching_gift_multiplier.sql` on Supabase before relying on multiplier in production.
- Exit gates: walk `docs/adrs/operational-readiness.md` §2–§3 (sandbox attribution + matching/refund tests).

## Sprint 3 — Epic 2 auctions (2026-05-20)

- PayPal Vault setup/confirm APIs; register UI; practice vault rehearsed in sandbox (2026-06-07).
- Cron sweep closes lots + `settleClosedLot` capture (migration `029`).
- Organizer console `/auctions/[id]/organizer` + CSV export.
- **Live:** PayPal Vault + live REST credentials on Vercel (`PAYPAL_ENVIRONMENT=production`) — deployed 2026-06-07.

## Sprint 4 — Realtime, anti-snipe, outbid fan-out (2026-05-20)

| Item | Status | Notes |
|------|--------|--------|
| S4.1–S4.2 Realtime + anti-snipe | **Complete** | Migrations `026`; `auctionChannel` on lot page |
| S4.4–S4.5 Enqueue path | **Complete** | `025`, `027`, Edge `notify-outbid` |
| S4.6 Dispatcher + sends | **Complete** | `send-delivery.ts`, cron `/api/cron/process-notification-deliveries` (5 min) |
| S4.7 Push permission UX | **Complete** | `public/sw.js`, push-subscribe API, post-bid prompt |
| S4.8 Tests | **Complete** | `outbid-payload.test.ts`, `send-delivery.test.ts` |
| Migration `030` | **Complete** | Applied on `yxzypekwyuopbanroobr` |
| Ops | **Complete** (2026-05-21) | Edge + Vault + `CRON_SECRET` on Vercel; prod cron drain **200** on www |

**Sprint 4 exit (engineering):** Code path enqueue → cron → push/SMS/in-app. **Full bid→delivery E2E smoke** still pending (no bids in DB). 10DLC for reliable US SMS.

## Sprint 5 — Polish & hardening (2026-05-20)

| Item | Status | Notes |
|------|--------|--------|
| S5.1 Leaderboard Realtime | **Complete** | `leaderboardChannel.ts`; 60s fallback poll |
| S5.2 Thermometer animations | **Complete** | `celebrateOnIncrease`; `LiveThermometer` on `/p/[slug]` |
| S5.3 Donor wall | **Complete** | `donor_wall_feed` + API + `DonorWall` on event page |
| S5.4 Accessibility | **Complete** | Bid sheet, donate form, leaderboard live regions |
| S5.5 Load tests | **Complete** | `scripts/load-test/k6-*.js` |
| S5.6 Observability runbook | **Complete** | `docs/runbooks/sprint5-observability.md` |
| Migration `031` | **Complete** | Applied on `yxzypekwyuopbanroobr` |

**Sprint 5 exit (engineering):** Polish shipped. **S5.5 / S5.6 ops** (k6 runs, dashboard wiring) tracked below — not blocking code merge.

---

## Phase GA — Go-live & first live event (ACTIVE — paused for live PayPal smoke)

**Date started:** 2026-05-21  
**Engineering deploy:** **Complete** (2026-05-21) — Vercel production successful  
**Internal recap (copy/paste):** [`docs/internal/phase-ga-engineering-sprint-2026-05-21.md`](docs/internal/phase-ga-engineering-sprint-2026-05-21.md)  
**Master checklist:** [`docs/phase-ga-go-live.md`](docs/phase-ga-go-live.md)  
**Context:** Sprints **0–5** engineering **complete**. No Sprint 6 in `docs/sprint-plan.md` — this phase is **ops + rehearsal + OR sign-off**.

**Commands:** `npm run ga:status` · `npm run p0:smoke` · `npm run validate` · `npm run test:a11y`

**Authoritative gates:** [`docs/adrs/operational-readiness.md`](docs/adrs/operational-readiness.md) §5 (Sprint 4 GA), §6 (per-event runbook).  
**Runbook:** [`docs/runbooks/sprint5-observability.md`](docs/runbooks/sprint5-observability.md).  
**Supabase project:** `yxzypekwyuopbanroobr`  
**Production URL:** `https://www.eventraisehub.com`

**Snapshot (2026-06-07, post go-live deploy):** P0 steps 1–4 **complete**; 10DLC **complete**; **PayPal live on Vercel** deployed; sandbox rehearsal **complete**. **Paused:** live vault+capture smoke — organizer has no **personal PayPal** yet (must create before bidder vault on www). **Pending when resumed:** live smoke (below), P0 step 5, OR §5, P2, OR §6.

### Phase GA engineering sprint — shipped (2026-05-21)

| Item | Status |
|------|--------|
| `LotBidForm` + sticky mobile Place bid | **Deployed** |
| `DonationAmountForm` — trust tokens, CTA scarcity | **Deployed** |
| `npm run test:a11y` (jest-axe) | **Deployed** |
| `ga:status` / `p0:smoke` www cron probe fix | **Deployed** |
| Supabase vs Neon evaluation | **Decision: stay on Supabase** |

### Program status

| Area | Engineering (repo) | Ops / GA |
|------|-------------------|----------|
| Epic 1 P2P (Sprints 1–2, 5) | **Complete** | OR §2–§3, §5.5 brand/a11y as needed |
| Epic 2 auctions (Sprints 3–4) | **Complete** | OR §4–§5 |
| Notifications (Sprint 4) | **Complete** | Cron verified on prod; 10DLC verified (2026-06-07) |
| Polish (Sprint 5) | **Complete** | k6 + dashboards |
| Phase GA engineering (2026-05-21) | **Deployed** | a11y/brand/cron scripts; see internal recap |
| PayPal live (2026-06-07) | **Deployed** | Vercel Production: live creds, `PAYPAL_ENVIRONMENT=production`, webhook; practice vault disabled |

### Ordered steps (do in sequence where possible)

#### P0 — Outbid path live

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | Deploy Edge: `supabase functions deploy notify-outbid` | Eng/Ops | **Complete** (2026-05-20) — `yxzypekwyuopbanroobr` |
| 2 | Vault secrets: `notify_outbid_edge_url`, `notify_outbid_service_role` | Eng/Ops | **Complete** — `npx tsx scripts/p0-apply-vault-secrets.ts` |
| 3 | Confirm `pg_net` + `bids` trigger (`027`) | Eng | **Complete** — trigger + `pg_net` verified via Management API |
| 4 | `CRON_SECRET` on Vercel + `.env.local` | Eng | **Complete** — on Vercel; manual drain OK via `www` host |
| 5 | Smoke: bid → deliveries → cron → push/in-app | Eng/QA | **Partial** — Edge auth OK (404 `bid_not_found`); no bids in DB yet; run `npm run p0:smoke` after first bid |

**Helper scripts:** `scripts/p0-apply-vault-secrets.ts`, `scripts/p0-smoke-outbid.ts`, `scripts/p0-print-vault-sql.ts`

Manual cron drain (use **www** host — apex → www redirect can drop `Authorization`):

```bash
source .env.local  # or export CRON_SECRET=…
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.eventraisehub.com/api/cron/process-notification-deliveries"
```

**Local:** `npm run dev` then same curl against `http://localhost:3000/...`

#### P0 — Twilio 10DLC (see also § S0.3b below)

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | Campaign **VERIFIED** + brand **APPROVED** in Twilio Console | Ops | **Complete** (2026-06-07) |
| 2 | Test US outbid SMS; no 30034/21610 | Eng/QA | **Pending** |
| 3 | STOP/HELP on Messaging Service | Ops | **Pending** |

**Blocks:** reliable US bulk SMS only — not Web Push or Verify login.

#### P1 — Payments & auctions

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | PayPal Vault enabled — live credentials on Vercel | Eng/Finance | **Complete** (2026-06-07) — live REST app + Vault + `PAYPAL_WEBHOOK_ID` on Vercel Production |
| 2 | Test lot close → `sweep-auction-lots` → `paypal_capture_id` set | Eng/QA | **Complete** (practice); **live capture smoke blocked** — need personal PayPal (see § Live smoke paused) |
| 3 | Organizer console + CSV on a real auction | Eng/QA | **Pending** |

#### P1 — Sprint 4 GA checklist (OR §5)

Walk **§5.0–§5.5** in operational-readiness.md, including:

- [ ] Sub-second Realtime on lot page; anti-snipe extension in final 60s — **manual QA**
- [ ] Web Push: subscribe after bid; outbid received (Chrome + Safari) — **manual QA**
- [ ] In-app `notifications` row + delivery dedupe (no double-send on replay) — **manual QA** (+ unit tests on payload/delivery)
- [x] `axe` zero serious/critical on bid sheet + donate flow — `npm run test:a11y` (`LotBidForm`, `DonationAmountForm`)
- [x] Brand: thermometers `bg-action-500`; CTA scarcity on donate presets (trust/secondary only; PayPal = pay CTA); sticky mobile bid CTA

**Status:** **Engineering checks in repo** — formal OR §5 sign-off still **pending** (Realtime/push/SMS rehearsal).

#### P2 — Load & observability (Sprint 5 ops)

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | k6 leaderboard: `scripts/load-test/k6-leaderboard.js` (`BASE_URL`, `EVENT_ID`) | Eng | **Pending** |
| 2 | k6 bidders (sandbox): `k6-auction-bids.js` + test JWT / lot ids | Eng | **Pending** |
| 3 | Record p95 + Realtime connection peak in `sprint5-observability.md` | Eng | **Pending** |
| 4 | Wire Sentry / Vercel / PostHog panels + alert routes from runbook | Eng | **Pending** |

#### Per-event runbook (OR §6) — first booked gala

| When | Actions | Status |
|------|---------|--------|
| **T-24h** | §5 gate green; event published; lots scheduled; PayPal/Twilio headroom; on-call set | **Pending** |
| **T-1h** | Synthetic bid → push &lt; 2s; Realtime headroom; no active Sentry incidents | **Pending** |
| **During** | Watch Realtime reports + logs + organizer console | — |
| **T+1h** | All captures reconciled; GMV matches payments | **Pending** |

### Optional future scope (not scheduled — “Sprint 6+”)

Only if product prioritizes after first gala:

- Broadcast channels for leaderboard / donor wall (beyond `postgres_changes`)
- Legacy `numeric` → full `_cents` migration on event fields
- Load test at **1.5×** booked concurrency (OR §5.4)
- Post-event organizer report (email + dashboard)

---

## Twilio 10DLC campaign verification (S0.3b) — complete

- Date completed: 2026-06-07
- Context: US A2P **campaign** registration for Programmable Messaging (outbid alerts, donation-share SMS). Separate from **Twilio Verify** (login OTP).
- **Done:** Campaign **VERIFIED** + brand **APPROVED** in Twilio Trust Hub; `TWILIO_MESSAGING_SERVICE_SID` on Vercel and `.env.local`.
- **Remaining QA:** Test US outbid SMS (no 30034/21610); confirm STOP/HELP on Messaging Service (OR §5.1).

---

## PayPal — live go-live (2026-06-07)

- **Status:** **Deployed** on Vercel Production (`https://www.eventraisehub.com`)
- **Vercel env (Production):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_ENVIRONMENT=production`, `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=production`, `PAYPAL_WEBHOOK_ID`
- **PayPal Dashboard (Live):** REST app with **Vault** enabled; webhook → `https://www.eventraisehub.com/api/paypal/webhook`
- **Practice vault:** **Disabled** in production (by design when `PAYPAL_ENVIRONMENT=production`)
- **Env split (canonical):** **Vercel Production = live** (`PAYPAL_ENVIRONMENT=production`); **local `.env.local` = sandbox** — CLI scripts (`paypal:rehearsal`, `ga:status`, `p0:smoke`) hit production Supabase/crons via `NEXT_PUBLIC_APP_URL=www` but PayPal OAuth from laptop uses sandbox creds unless you mirror live keys locally
- **Post-deploy smoke:** **Paused (2026-06-07)** — no personal PayPal account yet; create at [paypal.com](https://www.paypal.com) (Personal, not Business REST admin). Return to § **Live smoke paused** below.
- **Cron note:** `sweep-auction-lots` is daily in `vercel.json`; during live gala use manual `--close-lot` or tighten cron on Vercel Pro

## Live smoke paused (2026-06-07) — resume after break

- **Blocker:** Live vault on www requires a **personal PayPal** login at register — Business/developer credentials are not the payer account. Account not set up yet.
- **Seeded lot (may need refresh):** `npm run paypal:seed` if `closes_at` passed  
  - Last seed: auction `f6c0eed9-5e0a-4b55-aa0b-5524d6d1dff1` · lot `92ff23a8-9b37-44b5-9ecd-bcb793240a33` (slug `ga-vault-rehearsal`)
- **Resume checklist:**
  1. Create/link **personal PayPal**
  2. `npm run paypal:seed` (fresh open lot)
  3. www sign-in → `/auctions/{id}/register` → **Link PayPal** (live)
  4. Bid on lot (min $10)
  5. `npm run paypal:rehearsal -- --close-lot {lot_id}` → confirm real `paypal_capture_id`
  6. `npm run paypal:rehearsal -- --cleanup`

## PayPal Vault rehearsal (2026-06-07) — sandbox, complete

- **Runbook:** [`docs/runbooks/paypal-vault-rehearsal.md`](docs/runbooks/paypal-vault-rehearsal.md)
- **Scripts:** `npm run paypal:rehearsal` · `npm run paypal:seed` · `--check` · `--close-lot` · `--cleanup`
- **Env helpers:** `lib/paypal-env.ts`
- **Option B (practice vault):** **Complete** on Vercel sandbox (2026-06-07) — superseded for production by live vault above

## Authentication — Twilio Verify (S0.3a)

- Date: 2026-05-20
- Decision: Phone OTP via **Twilio Verify** only; `/auth/login` and `/auth/register` no longer use email/password.
- Env (Vercel + `.env.local`): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` — **deployed**.
- Messaging env: `TWILIO_MESSAGING_SERVICE_SID` on Vercel ✓ (usable at full deliverability once 10DLC campaign verifies).

## Authentication — superseded (2026-04-15)

- Email/password + Supabase CAPTCHA workaround is **obsolete** after ADR-0017.

## Sprint 0 — VAPID (S0.6)

- Date: 2026-05-20
- Status: **Complete** — keys in `.env.local` and Vercel.
- Used for Web Push (ADR-0003), not for login.

## Sprint 0 — SendGrid removed (S0.4)

- Date: 2026-05-20
- Status: **Complete** — `@sendgrid/mail` and `lib/sendgrid.ts` removed.

## Platform Super Admin Console (2026-05-21)

- **Separate login:** `/admin/login` — registered **email + phone** + **`PLATFORM_ADMIN_PASSWORD`** (no Twilio). Not `/auth/login`.
- **Bootstrap super admin:** `raoc@onthemarc.net` + `+15079931292` in `platform_admins` (migration `032`).
- **Console:** `/admin` — reports, payouts, **Admins** roster (super admin only) at `/admin/admins`.
- **Create admins:** Super admin POST `/api/admin/platform-admins`; new admins use same static login.
- **Later:** set `PLATFORM_ADMIN_USE_TWILIO=true` and re-enable OTP routes when ready.

## Platform — database vendor (2026-05-21)

- **Evaluated:** Neon vs Supabase (cost).
- **Decision:** **Remain on Supabase** — ERH depends on Auth, Realtime, Edge/`pg_net`, RLS, and Storage ADRs; Neon is Postgres-only.
- **Cost follow-up:** Right-size Supabase tier — not a DB migration.

## Go-live deploy log (2026-06-07)

| Area | Action | Status |
|------|--------|--------|
| PayPal | Live REST credentials + Vault + webhook on Vercel Production | **Deployed** |
| PayPal env | `PAYPAL_ENVIRONMENT` / `NEXT_PUBLIC_PAYPAL_ENVIRONMENT` → `production` | **Deployed** |
| Twilio | Verify + Messaging (10DLC verified) — unchanged on deploy | **Live** |
| Supabase | `yxzypekwyuopbanroobr` — no migration required for flip | **Live** |
| Crons | `process-notification-deliveries` (5m), `sweep-auction-lots` (daily) | **Live** |
| Rehearsal data | `npm run paypal:rehearsal -- --cleanup` | **Complete** |
| Env model | Vercel Production = **live** PayPal; `.env.local` = **sandbox** | **Confirmed** |
| Live smoke | Personal PayPal + vault → bid → capture on www | **Paused** — resume per § Live smoke paused |
