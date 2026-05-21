# Project Ledger

**Internal sprint outputs (full recap):** [`docs/internal/sprint-phase-recap.md`](docs/internal/sprint-phase-recap.md)

## Sprint 0 — status (2026-05-20)

| Item | Status | Notes |
|------|--------|--------|
| S0.1–S0.2 ADRs + sprint plan | **Complete** | Locked baseline |
| S0.3a Twilio Verify auth | **Complete** | ADR-0017; phone OTP on `/auth/login`, `/auth/register`; env on Vercel |
| S0.3b Twilio 10DLC campaign verification | **In process** | `TWILIO_MESSAGING_SERVICE_SID` on Vercel ✓; awaiting carrier **campaign `VERIFIED`** (often weeks) |
| S0.4 SendGrid removed | **Complete** | No `@sendgrid/mail`; push + SMS + in-app only |
| S0.5 Supabase Pro | **Complete** | Pro confirmed; capacity gate satisfied for feature work |
| S0.6 VAPID | **Complete** | Keys in `.env.local` + Vercel |
| S0.7 Braintree sunset | **Complete** | 2026-05-13 |
| Vercel deployment | **Complete** | Production deploy successful (2026-05-20) |

**Sprint 0 exit:** Green for engineering. Infra/env for Twilio Messaging is done; **carrier campaign verification** is the only long-lead wait (weeks, not a code task).

## Sprint 2 — Epic 1 P2P (2026-05-20)

- Status: **Shipped in repo** — edit fundraiser (`?edit=slug`), team create UI, leaderboard page, matching multiplier migration `028`, organizer matching-gift POST, donation amplified note.
- Apply migration `028_matching_gift_multiplier.sql` on Supabase before relying on multiplier in production.
- Exit gates: walk `docs/adrs/operational-readiness.md` §2–§3 (sandbox attribution + matching/refund tests).

## Sprint 3 — Epic 2 auctions (2026-05-20)

- PayPal Vault setup/confirm APIs; register UI; practice vault in sandbox.
- Cron sweep closes lots + `settleClosedLot` capture (migration `029`).
- Organizer console `/auctions/[id]/organizer` + CSV export.
- Apply migrations `029` on Supabase; enable PayPal Vault in sandbox app settings.

## Sprint 4 — Realtime, anti-snipe, outbid fan-out (2026-05-20)

| Item | Status | Notes |
|------|--------|--------|
| S4.1–S4.2 Realtime + anti-snipe | **Complete** | Migrations `026`; `auctionChannel` on lot page |
| S4.4–S4.5 Enqueue path | **Complete** | `025`, `027`, Edge `notify-outbid` |
| S4.6 Dispatcher + sends | **Complete** | `send-delivery.ts`, cron `/api/cron/process-notification-deliveries` (5 min) |
| S4.7 Push permission UX | **Complete** | `public/sw.js`, push-subscribe API, post-bid prompt |
| S4.8 Tests | **Complete** | `outbid-payload.test.ts`, `send-delivery.test.ts` |
| Migration `030` | **Complete** | Applied on `yxzypekwyuopbanroobr` |
| Ops | **Partial** | Edge deployed + Vault secrets done; Vercel `CRON_SECRET` + full bid smoke pending |

**Sprint 4 exit (engineering):** Code path enqueue → cron → push/SMS/in-app. GA still needs ops checklist (§5 Sprint 4 gate) + 10DLC for reliable US SMS.

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

## Phase GA — Go-live & first live event (ACTIVE)

**Date started:** 2026-05-21  
**Master checklist:** [`docs/phase-ga-go-live.md`](docs/phase-ga-go-live.md)  
**Context:** Sprints **0–5** engineering **complete**. No Sprint 6 in `docs/sprint-plan.md` — this phase is **ops + rehearsal + OR sign-off**.

**Commands:** `npm run ga:status` · `npm run p0:smoke` · `npm run validate`

**Authoritative gates:** [`docs/adrs/operational-readiness.md`](docs/adrs/operational-readiness.md) §5 (Sprint 4 GA), §6 (per-event runbook).  
**Runbook:** [`docs/runbooks/sprint5-observability.md`](docs/runbooks/sprint5-observability.md).  
**Supabase project:** `yxzypekwyuopbanroobr`

**Snapshot (2026-05-21):** Edge notify-outbid OK; migrations through `032` applied; prod cron **401** until `CRON_SECRET` on Vercel; zero bids/pending deliveries in DB for E2E smoke yet.

### Program status

| Area | Engineering (repo) | Ops / GA |
|------|-------------------|----------|
| Epic 1 P2P (Sprints 1–2, 5) | **Complete** | OR §2–§3, §5.5 brand/a11y as needed |
| Epic 2 auctions (Sprints 3–4) | **Complete** | OR §4–§5 |
| Notifications (Sprint 4) | **Complete** | Edge deploy, cron, 10DLC |
| Polish (Sprint 5) | **Complete** | k6 + dashboards |

### Ordered steps (do in sequence where possible)

#### P0 — Outbid path live

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | Deploy Edge: `supabase functions deploy notify-outbid` | Eng/Ops | **Complete** (2026-05-20) — `yxzypekwyuopbanroobr` |
| 2 | Vault secrets: `notify_outbid_edge_url`, `notify_outbid_service_role` | Eng/Ops | **Complete** — `npx tsx scripts/p0-apply-vault-secrets.ts` |
| 3 | Confirm `pg_net` + `bids` trigger (`027`) | Eng | **Complete** — trigger + `pg_net` verified via Management API |
| 4 | `CRON_SECRET` on Vercel + `.env.local` | Eng | **Partial** — generated in `.env.local`; **add same value to Vercel** (prod curl returned 401) |
| 5 | Smoke: bid → deliveries → cron → push/in-app | Eng/QA | **Partial** — Edge auth OK (404 `bid_not_found`); no bids in DB yet; drain after Vercel `CRON_SECRET` |

**Helper scripts:** `scripts/p0-apply-vault-secrets.ts`, `scripts/p0-smoke-outbid.ts`, `scripts/p0-print-vault-sql.ts`

Manual cron drain (after Vercel env matches `.env.local`):

```bash
source .env.local  # or export CRON_SECRET=…
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "${NEXT_PUBLIC_APP_URL:-https://eventraisehub.com}/api/cron/process-notification-deliveries"
```

**Local:** `npm run dev` then same curl against `http://localhost:3000/...`

#### P0 — Twilio 10DLC (see also § S0.3b below)

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | Campaign **VERIFIED** + brand **APPROVED** in Twilio Console | Ops | **In process** |
| 2 | Test US outbid SMS; no 30034/21610 | Eng/QA | **Pending** |
| 3 | STOP/HELP on Messaging Service | Ops | **Pending** |

**Blocks:** reliable US bulk SMS only — not Web Push or Verify login.

#### P1 — Payments & auctions

| # | Step | Owner | Status |
|---|------|-------|--------|
| 1 | PayPal Vault enabled — sandbox E2E, then live credentials on Vercel | Eng/Finance | **Pending** |
| 2 | Test lot close → `sweep-auction-lots` → `paypal_capture_id` set | Eng/QA | **Pending** |
| 3 | Organizer console + CSV on a real auction | Eng/QA | **Pending** |

#### P1 — Sprint 4 GA checklist (OR §5)

Walk **§5.0–§5.5** in operational-readiness.md, including:

- [ ] Sub-second Realtime on lot page; anti-snipe extension in final 60s
- [ ] Web Push: subscribe after bid; outbid received (Chrome + Safari)
- [ ] In-app `notifications` row + delivery dedupe (no double-send on replay)
- [ ] `axe` zero serious/critical on bid sheet + `/donations/new`
- [ ] Brand: `bg-action-500` thermometers; CTA scarcity on bid/donate pages

**Status:** **Pending** formal sign-off.

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

## Twilio 10DLC campaign verification (S0.3b) — in process

- Date logged: 2026-05-20 (updated: Messaging Service env already deployed)
- Context: US A2P **campaign** registration for Programmable Messaging (outbid alerts, donation-share SMS). Separate from **Twilio Verify** (login OTP).
- **Already done (engineering):** `TWILIO_MESSAGING_SERVICE_SID` (+ account/token) in Vercel and `.env.local`; Messaging Service wired in code (`lib/twilio-sms.ts`).
- **Still waiting (carriers / Twilio Trust Hub):** A2P campaign status → **`VERIFIED`** (and brand **`APPROVED`** if not already). This step often takes **several weeks**; no further app deploy required when it lands.
- **Done when:** Twilio Console shows campaign **Verified**; test US outbound delivers without 30034/21610-style errors; optional: confirm STOP/HELP on the Messaging Service.
- **Does not block:** Verify sign-in, Vercel deploy, Sprint 2–3 feature work, Web Push.
- **Blocks:** Sprint 4 GA gate for **reliable US bulk SMS** (Operational Readiness §5.1 SMS).

---

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
