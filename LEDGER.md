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
| Ops | **Pending** | Deploy Edge `notify-outbid`; Vault `pg_net` secrets; `NEXT_PUBLIC_VAPID_PUBLIC_KEY` on Vercel |

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
