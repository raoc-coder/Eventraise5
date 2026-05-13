# Sprint Plan — Epics 1 & 2 (Locked)

- **Status:** Locked 2026-05-12; **re-locked 2026-05-12 (management)** — Braintree sunset **authorized** (ADR-0016); Epic 2 delivery **renumbered** into Sprints **3–4** (was 3–5/6).
- **Cadence:** 2-week sprints (Sprint 0 is a 1-week foundation).
- **Authoritative decisions:** see [`docs/adrs/`](./adrs) (includes **ADR-0016** — Braintree sunset).
- **Epics in scope:**
  - Epic 1 — Native Peer-to-Peer (P2P) Infrastructure
  - Epic 2 — Auctions and Real-Time Mobile Bidding

## Conventions

- All schema changes land as Supabase SQL migrations under `supabase/migrations/NNN_*.sql` (ADR-0001).
- All new monetary columns use **integer cents** with the `_cents` suffix (ADR-0011).
- All writes carry a **client-supplied idempotency key** (ADR-0009).
- All new UI uses only the `trust-*` and `action-*` token families (ADR-0013) — **Trust Blue ~70%** for structure and security surfaces; **Action Orange ~30%** for high-impact CTAs and dynamic progress (thermometers, leaderboards, live bid state).
- Realtime reads via Supabase Realtime with sanitized payloads; writes via server API routes using the service-role key (ADR-0012).
- **Payments:** PayPal only (Sprint **0.7** executed **2026-05-13** — ADR-0016).

## Sprint 0 — Foundations (1 week)

| # | Deliverable | Owner | Status |
|---|---|---|---|
| S0.1 | ADR set 0001–0015 in `docs/adrs/` | Tech lead | Done |
| S0.2 | This sprint plan in `docs/sprint-plan.md` | Tech lead | Done |
| S0.3 | Twilio account + 10DLC brand & A2P campaign submitted | Ops + Eng | **Initiated 2026-05-12** — awaiting Twilio approval (~2–4 wk SLA) |
| S0.4 | SendGrid domain auth (SPF / DKIM / DMARC) for `eventraisehub.com` | Eng + Marketing | **Initiated 2026-05-12** — awaiting DNS propagation + SendGrid verification |
| S0.5 | Supabase capacity confirmed — see [Operational Readiness §1](./adrs/operational-readiness.md#1-foundation-gate-pre-sprint-1) | Eng | **Initiated 2026-05-12** — awaiting confirmation per §S0.5 checklist below |
| S0.6 | VAPID keypair generated and stored in env scopes — run `npm run generate:vapid -- --vercel` | Eng | Runner ready 2026-05-12 — awaiting Vercel env paste |
| S0.7 | Braintree sunset — **decision + execution** (ADR-0016) | Eng + Finance | **Done** — code removed 2026-05-13 |

### External-track progress log

| Date | Item | Status | "Done" means |
|---|---|---|---|
| 2026-05-12 | Twilio 10DLC brand + A2P campaign | Submitted; awaiting carrier approval | Messaging Service SID in Vercel; brand `APPROVED`; campaign `VERIFIED` |
| 2026-05-12 | SendGrid domain auth | DNS added; awaiting verification | SPF, DKIM, DMARC pass on test send |
| 2026-05-12 | Supabase capacity | In motion | Plan ≥ Pro (no spend cap); Realtime connections ≥ 2,000; `pg_net` on; replication-lag report populates |

**S0.5 — concrete checklist:**

1. Plan tier is **Pro (no spend cap)** or higher — `Dashboard → Settings → Billing`.
2. **Realtime Settings** — `Dashboard → Project Settings → Realtime`:
   - "Max concurrent connections" set to **≥ 2,000** (target: 2,500 for first booked gala).
   - "Max events per second" set to **≥ 500** (broadcast throughput for live bidding).
   - "Max payload size in KB" left at default (sanitized bid events stay <10 KB per ADR-0012).
3. **`pg_net` extension** enabled (`Database → Extensions`); verify with  
   `select extname, extversion from pg_extension where extname = 'pg_net';`.
4. **Realtime headroom verified** under load — k6 or Artillery to 1,500 concurrent WebSockets for 5 min with zero `tenant_*_rate_limit` errors in `Database → Realtime Logs`.
5. **Replication-lag visibility** — `Project Settings → Product Reports → Realtime → Broadcast from DB Replication Lag` populates (Pro+); supports **Sprint 4** SLOs (ADR-0014).

**Exit criterion:** Sprint 1 can start without Twilio/SendGrid being fully approved; those gates block **Sprint 4** (first gala-grade outbid + SMS). All Sprint exit criteria reference [`docs/adrs/operational-readiness.md`](./adrs/operational-readiness.md).

---

## Sprint 0.7 — Braintree sunset execution (management lock)

**Goal:** remove Braintree entirely; **PayPal is the only supported processor** for web checkout and future auction flows.

| # | Deliverable |
|---|---|
| S0.7.1 | Remove `braintree`, `braintree-web`, `braintree-web-drop-in`, `@types/braintree-web` from `package.json` / lockfile |
| S0.7.2 | Delete or archive: `lib/braintree-server.ts`, `lib/braintree-client.ts`, `hooks/use-braintree-checkout.ts`, `types/braintree.d.ts` |
| S0.7.3 | Remove or hard-`410` all `app/api/braintree/**` and align `app/api/webhooks/braintree` with product policy |
| S0.7.4 | Update Cypress / E2E and `scripts/setup-env.js` — no Braintree URLs or env prompts |
| S0.7.5 | Payouts / migration-status routes: stop depending on Braintree columns for **new** behavior; legacy columns read-only until optional migration |
| S0.7.6 | Parity sign-off per **ADR-0016** checklist; `npm test`, `npm run build`, `tsc --noEmit` green |

**Exit:** no `braintree` imports in app or `lib/`; donation + ticket PayPal paths verified; docs and ADR index mention sunset complete.

**Status:** **Complete** as of **2026-05-13** (this repository).

**Next:** *Begin Sprint 2* — Epic 1 completion (teams, matching gifts, Become a fundraiser).

---

## Sprint 1 — P2P foundations (US 1.1)

**Goal:** personal fundraising pages at `/p/[slug]` tied to an event.

| # | Deliverable |
|---|---|
| S1.1 | Migration `021_p2p_personal_campaigns.sql` — `personal_campaigns` + `donation_requests.personal_campaign_id` + RLS + rollup trigger |
| S1.2 | Stub helpers — `lib/money/cents.ts`, `lib/realtime/auctionChannel.ts`, `lib/notifications/dispatcher.ts` |
| S1.3 | Public route — `app/p/[slug]/page.tsx` + `Thermometer` (`action-500` fill) |
| S1.4 | API stubs — `app/api/personal-campaigns/*` → `501` until wired |
| S1.5 | Tests — cents + Thermometer |

**Exit:** seeded slug renders; thermometer brand-correct; tests + build green.

**Out of scope:** authenticated "Become a fundraiser" creator UI (Sprint 2); donation attribution (Sprint 1.5).

---

## Sprint 1.5 — P2P donation attribution

**Goal:** PayPal donations from `/p/[slug]` credit `personal_campaigns.total_raised_cents` via `donation_requests.personal_campaign_id`.

| # | Deliverable |
|---|---|
| S1.5.1 | Migration `022_paypal_orders_personal_campaign.sql` |
| S1.5.2 | `lib/p2p/personal-campaigns.ts` + PayPal create/capture wiring + banner |

**Exit:** sandbox happy path + negative attribution tests per operational readiness §2a.

**Out of scope:** authenticated page creation (Sprint 2).

---

## Sprint 2 — Epic 1 completion: teams, matching gifts, auth "Become a fundraiser"

**Goal:** authenticated users can create personal campaigns; teams, leaderboards, and matching-gift amplification ship. **Mobile-first**; strict **trust / action** ratio (ADR-0013).

### User Story 2.1 — Authenticated "Become a Fundraiser" flow

| # | Deliverable |
|---|---|
| S2.1 | Auth-gated UI (register / login as required) to create/edit `personal_campaigns` (slug, story, goal, cover) tied to a parent `event_id` |
| S2.2 | Server routes: replace `501` on `app/api/personal-campaigns` with real POST/PATCH/GET + idempotency (ADR-0009) |
| S2.3 | RLS alignment tests — owner vs anon vs other user |

### User Story 2.2 — Team capabilities & gamification

| # | Deliverable |
|---|---|
| S2.4 | Migration `023_p2p_teams_matching.sql` — `teams`, `team_members`, `matching_gifts`, `personal_campaigns.team_id` FK, rollups |
| S2.5 | APIs — team CRUD, members, leaderboards (event / team / individual) |
| S2.6 | UI — team pages; **leaderboards** with Action Orange for rank movement / highlights; **matching gift** banner + amplified counter |
| S2.7 | Donation finalize — matching pool caps; atomic updates to event + team + personal totals; refund reversal |
| S2.8 | Tests — leaderboard math, matching exhaustion, refund |

**Exit:** Epic 1 user stories satisfied for P2P + gamification; leaderboards may be **polled** (Realtime upgrade → Sprint 5 polish).

**Out of scope:** auction schema (Sprint 3); sub-second auction broadcast (Sprint 4).

---

## Sprint 3 — Epic 2 kick-off: auction infrastructure, PayPal vault, mobile bidding

**Goal:** foundation for silent + live auctions; **vault at registration, capture on win** (ADR-0006). All new money in **integer cents**.

**Repository progress (2026-05-13):** migration `024_auctions.sql` + `place_auction_bid` RPC; REST routes under `app/api/auctions/**`, `app/api/events/[id]/auctions`, and `app/api/cron/sweep-auction-lots` (pair with `CRON_SECRET` in Vercel); mobile-first pages under `app/auctions/[id]/…`. **Next in-sprint work:** PayPal vault token persistence (S3.2), capture-on-win server path (S3.3), organizer CSV export (S3.5), bid stress tests (S3.9).

### User Story 3.1 — Auction registration & payment vaulting

| # | Deliverable |
|---|---|
| S3.1 | Migration `024_auctions.sql` — `auctions`, `auction_lots`, `bids`, `auction_registrations` (and related), `_cents` columns, idempotency uniqueness |
| S3.2 | Registration flow — vault PayPal payment method at sign-up; store vault token server-side (service role); link to `auction_registrations` |
| S3.3 | Capture-on-win — server path to capture winning amount after lot close (PayPal Orders / vault semantics per ADR-0006) |
| S3.4 | Vercel Cron (or Edge cron) — sweep lots approaching / past `closes_at`; reconcile status |
| S3.5 | Organizer console MVP — GMV, sell-through, fees |

### User Story 3.2 — Mobile-first bidding interface

| # | Deliverable |
|---|---|
| S3.6 | Routes — `app/auctions/[id]/…`, `…/lots/[lotId]/…`, `…/register` (exact tree in implementation PR) |
| S3.7 | Server bid API — auth, increments, idempotency (ADR-0007 base increments; anti-snipe **logic lands Sprint 4**) |
| S3.8 | Bid sheet UI — sticky-bottom primary CTA uses **Action Orange**; trust framing for payment + security copy |
| S3.9 | Tests — bid rules, idempotency replay; **polling** acceptable (default 5 s) until Sprint 4 |

**Exit:** bidder can register, vault, browse lots, and place **authoritative** bids from a phone; winner capture path exercised in sandbox.

**Out of scope:** sub-second Realtime fan-out; anti-snipe extension; outbid push/SMS (Sprint 4).

---

## Sprint 4 — Epic 2 completion: realtime bidding, anti-snipe, outbid fan-out

**Goal:** sub-second bid visibility; **anti-snipe**; **maximize GMV** via instant outbid alerts (push + Twilio SMS + email).

### User Story 4.1 — Realtime channels & anti-snipe

| # | Deliverable |
|---|---|
| S4.1 | Supabase Realtime — broadcast sanitized bid events (ADR-0012); finalize `lib/realtime/auctionChannel.ts` |
| S4.2 | **Anti-snipe:** if a bid lands in the **final 60 seconds** before `closes_at`, extend lot close by **120 seconds** (management lock; configurable later per ADR-0007) |
| S4.3 | Load + SLO instrumentation toward ADR-0014 (push / SMS latency) |

### User Story 4.2 — Outbid notification fan-out

| # | Deliverable |
|---|---|
| S4.4 | Migration `025_notifications_realtime.sql` — `push_subscriptions`, `notification_preferences`, `notification_deliveries` |
| S4.5 | Edge Function `notify-outbid` + `pg_net` trigger from `public.bids` (ADR-0008) |
| S4.6 | Channels — Web Push (VAPID), Twilio SMS, SendGrid email, in-app; **dispatcher** implementation replaces stub |
| S4.7 | Permission UX — prompt after bid intent (ADR-0003) |
| S4.8 | Tests — dedupe keys, fan-out idempotency, channel prefs |

**Exit:** first booked-gala criteria per [Operational Readiness §5 — Sprint 4 GA gate](./adrs/operational-readiness.md); outbid SLOs measurable (ADR-0014).

---

## Sprint 5 — Post-Epic-2 polish & hardening (optional / parallelizable)

**Goal:** GA hardening not strictly blocking Epic 2 narrative closure.

| # | Deliverable |
|---|---|
| S5.1 | P2P leaderboards on Realtime (replace polling where needed) |
| S5.2 | Thermometer micro-animations on donation events |
| S5.3 | Donor wall realtime (`app/api/donor-wall` evolution) |
| S5.4 | Accessibility pass — bid sheet + donate + leaderboard focus / live regions |
| S5.5 | Load test — 1k concurrent bidders / 5k leaderboard viewers |
| S5.6 | Observability dashboards + alert policies frozen in runbooks |

**Exit:** production hardening complete; per-event runbook rehearsed.

---

## Cross-sprint guardrails

- Every PR includes a brand-checklist line item against ADR-0013.
- Every new migration ships with RLS contract tests where feasible (anon / authenticated / owner / service role).
- Every mutating endpoint enforces client idempotency keys (ADR-0009).
- Monetary display + new columns: `lib/money/cents.ts` (ADR-0011); legacy `numeric` display may remain on `lib/currency.ts` until fully migrated.
