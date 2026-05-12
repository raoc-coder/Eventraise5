# Sprint Plan — Epics 1 & 2 (Locked)

- **Status:** Locked 2026-05-12 (Sprint 0 baseline approved)
- **Cadence:** 2-week sprints (Sprint 0 is a 1-week foundation)
- **Authoritative decisions:** see [`docs/adrs/`](./adrs)
- **Epics in scope:**
  - Epic 1 — Native Peer-to-Peer (P2P) Infrastructure
  - Epic 2 — Auctions and Real-Time Mobile Bidding

## Conventions

- All schema changes land as Supabase SQL migrations under `supabase/migrations/NNN_*.sql` (ADR-0001).
- All new monetary columns use **integer cents** with the `_cents` suffix (ADR-0011).
- All writes carry a **client-supplied idempotency key** (ADR-0009).
- All new UI uses only the `trust-*` and `action-*` token families (ADR-0013).
- Realtime reads via Supabase Realtime with sanitized payloads; writes via server API routes using the service-role key (ADR-0012).

## Sprint 0 — Foundations (1 week, in progress)

| # | Deliverable | Owner | Status |
|---|---|---|---|
| S0.1 | ADR set 0001–0015 in `docs/adrs/` | Tech lead | Done |
| S0.2 | This sprint plan in `docs/sprint-plan.md` | Tech lead | Done |
| S0.3 | Twilio account + 10DLC brand & A2P campaign submitted | Ops + Eng | In progress (long lead) |
| S0.4 | SendGrid domain auth (SPF / DKIM / DMARC) for `eventraisehub.com` | Eng + Marketing | In progress (DNS) |
| S0.5 | Supabase capacity confirmed — see [Operational Readiness §1](./adrs/operational-readiness.md#1-foundation-gate-pre-sprint-1) | Eng | Pending |
| S0.6 | VAPID keypair generated and stored in env scopes | Eng | Pending |
| S0.7 | Decision on Braintree (keep / sunset / remove) | Eng + Finance | Pending |

**S0.5 — concrete checklist:**

1. Plan tier is **Pro (no spend cap)** or higher — confirm in `Dashboard → Settings → Billing`.
2. **Realtime Settings** — `Dashboard → Project Settings → Realtime`:
   - "Max concurrent connections" set to **≥ 2,000** (target: 2,500 for first booked gala).
   - "Max events per second" set to **≥ 500** (broadcast throughput for live bidding).
   - "Max payload size in KB" left at default (sanitized bid events stay <10 KB per ADR-0012).
3. **`pg_net` extension** enabled (`Database → Extensions`); verify with
   `select extname, extversion from pg_extension where extname = 'pg_net';`.
4. **Realtime headroom verified** under load — k6 or Artillery to 1,500 concurrent WebSockets for 5 min with zero `tenant_*_rate_limit` errors in `Database → Realtime Logs`.
5. **Replication-lag visibility** present — `Project Settings → Product Reports → Realtime → Broadcast from DB Replication Lag` populates (Pro+ only); this is the Sprint 5 SLO source for outbid push p95 ≤ 2 s (ADR-0014).

**Exit criterion:** Sprint 1 can start without any external blockers other than Twilio 10DLC (which only blocks Sprint 5). All Sprint exit criteria below are gated by the corresponding section of [`docs/adrs/operational-readiness.md`](./adrs/operational-readiness.md).

## Sprint 1 — P2P foundations (US 1.1)

**Goal:** event attendees and volunteers can spin up a personal fundraising page tied to an event.

| # | Deliverable |
|---|---|
| S1.1 | Migration `021_p2p_personal_campaigns.sql` — `personal_campaigns` table + `donation_requests.personal_campaign_id` + RLS + rollup trigger |
| S1.2 | Stub helpers — `lib/money/cents.ts`, `lib/realtime/auctionChannel.ts`, `lib/notifications/dispatcher.ts` (interface only) |
| S1.3 | Public route shell — `app/p/[slug]/page.tsx` rendering the campaign with the new Thermometer (`action-500` fill) |
| S1.4 | Thermometer primitive — `components/p2p/Thermometer.tsx` (ARIA `progressbar`, mobile-first) |
| S1.5 | API stubs — `app/api/personal-campaigns/route.ts` and `app/api/personal-campaigns/[slug]/route.ts` returning `501` until wired in Sprint 1.5 |
| S1.6 | Tests — cents helper unit tests, Thermometer render tests |

**Exit:** an event can host N personal pages (data model in place); page renders for any seeded slug; thermometer fills with `action-500`; all changes pass `npm test` and `npm run build`.

**Out of scope for Sprint 1:** authenticated "Become a fundraiser" UI flow (lands Sprint 2), donor-attribution server-side wiring (lands Sprint 1.5).

## Sprint 1.5 — P2P donation attribution

**Goal:** a donor arriving from `/p/[slug]` has their succeeded donation credited back to that personal campaign via the existing PayPal flow.

| # | Deliverable |
|---|---|
| S1.5.1 | Migration `022_paypal_orders_personal_campaign.sql` — `paypal_orders.personal_campaign_id` (nullable FK + index) |
| S1.5.2 | `lib/p2p/personal-campaigns.ts` — server-side `loadActivePersonalCampaign` validator (status + event match) |
| S1.5.3 | `/api/paypal/create-order` — accept `personalCampaignId`, validate, persist on `paypal_orders` |
| S1.5.4 | `/api/paypal/capture-order` — propagate `personal_campaign_id` from `paypal_orders` onto the `donation_requests` insert |
| S1.5.5 | `PayPalDonationButton` — accept `personalCampaignId`, include in idempotency fingerprint |
| S1.5.6 | `app/donations/new/page.tsx` — read `personalCampaignId` from URL, render `FundraiserAttributionBanner`, pass to button |
| S1.5.7 | Brand-correct banner — `components/p2p/FundraiserAttributionBanner.tsx` (trust chrome, action accent) |
| S1.5.8 | Tests — helper rejects invalid pcid / wrong event / non-active, banner renders display name |

**Exit:** end-to-end happy path — donate from `/p/[slug]` → PayPal sandbox capture → `donation_requests` row has `personal_campaign_id` set → migration 021 trigger fires → `personal_campaigns.total_raised_cents` increments. Banner shows the fundraiser's name on the donation page. Invalid `personalCampaignId` drops attribution silently; donation still succeeds against the event. All changes pass `npm test`, `npm run build`, and `tsc --noEmit`.

**Out of scope for Sprint 1.5:** UI for owners to *create* a personal campaign (Sprint 2), team rollups, leaderboards.

## Sprint 2 — Teams, leaderboards, matching gifts (US 1.2)

| # | Deliverable |
|---|---|
| S2.1 | Migration `023_p2p_teams_matching.sql` — `teams`, `team_members`, `matching_gifts`, FK on `personal_campaigns.team_id`, denormalized rollups |
| S2.x | Authenticated "Become a fundraiser" UI flow (creates a `personal_campaigns` row for the current user) — was deferred from Sprint 1 |
| S2.2 | API — team CRUD, member add/remove, leaderboard endpoints |
| S2.3 | UI — team detail page, leaderboards (event / team / individual), matching-gift banner with multiplied counter |
| S2.4 | Donation finalize hook — evaluates matching gifts, updates team and personal totals atomically |
| S2.5 | Tests — leaderboard correctness, matching-gift cap exhaustion, rollback on refund |

**Exit:** teams form, totals roll up to event / team / personal correctly; leaderboards visible (polled, not yet realtime).

## Sprint 3 — Auctions, data model + mobile bidding UI (US 2.1)

| # | Deliverable |
|---|---|
| S3.1 | Migration `024_auctions.sql` — `auctions`, `auction_lots`, `bids`, `auction_registrations`, integer-cents columns, unique idempotency-key constraint |
| S3.2 | Route shells — `app/auctions/[id]/page.tsx`, `app/auctions/[id]/lots/[lotId]/page.tsx`, `app/auctions/[id]/register/page.tsx` |
| S3.3 | Server bid API — `app/api/auctions/[id]/lots/[lotId]/bid/route.ts` (session check, increment validation, idempotency) |
| S3.4 | Bid sheet UI — sticky-bottom CTA in `action-500`, security badge in `trust-700` near payment |
| S3.5 | Tests — bid acceptance rules, idempotency replay, increment enforcement |

**Exit:** an auction can run with manual refresh / 5-second polling; bids are server-authoritative and idempotent.

## Sprint 4 — Live auction + checkout (US 2.1 cont.)

| # | Deliverable |
|---|---|
| S4.1 | Lot lifecycle — open / closing / closed states + organizer console |
| S4.2 | PayPal vault at registration; capture on close (ADR-0006) |
| S4.3 | Vercel Cron sweep — closes lots and captures winners during live windows |
| S4.4 | Organizer reports — GMV per lot, sell-through, fees |
| S4.5 | Tests — close → capture flow with PayPal sandbox |

**Exit:** an auction completes end-to-end with payment capture and basic reporting.

## Sprint 5 — Realtime + outbid notifications (US 2.2)

| # | Deliverable |
|---|---|
| S5.1 | Migration `025_notifications_realtime.sql` — `push_subscriptions`, `notification_preferences`, `notification_deliveries` |
| S5.2 | Realtime subscriptions — `lib/realtime/auctionChannel.ts` finalized; sanitized payloads (ADR-0012) |
| S5.3 | Edge Function `supabase/functions/notify-outbid` — fan-out with idempotent `dedupe_key` |
| S5.4 | Channel implementations — web push (VAPID), Twilio SMS, SendGrid email, in-app toast |
| S5.5 | Permission prompts — only after bid intent (ADR-0003) |
| S5.6 | Tests — fan-out idempotency, channel preferences, retry/backoff |

**Exit:** outbid notifications meet the SLOs in ADR-0014 (push p95 ≤ 2s, SMS p95 ≤ 5s).

## Sprint 6 — Gamification polish + hardening

| # | Deliverable |
|---|---|
| S6.1 | Realtime leaderboards (P2P) switching from polling to Realtime channel |
| S6.2 | Animated thermometer fill on each donation event (`action-500`) |
| S6.3 | Donor wall realtime updates (extends `app/api/donor-wall/route.ts`) |
| S6.4 | Accessibility audit on bid + donate flows (focus mgmt, ARIA live regions) |
| S6.5 | Load test — 1k concurrent bidders on one auction, 5k donors on one event leaderboard |
| S6.6 | Observability dashboards + SLO alerts active (ADR-0014) |

**Exit:** GA-ready for the first booked gala; instrumented; brand-compliant; load-validated. Confirm against [Operational Readiness §5 — Sprint 5 GA gate](./adrs/operational-readiness.md#5-sprint-5-ga-gate-notifications--live-auctions) and the [per-event runbook](./adrs/operational-readiness.md#6-per-event-runbook).

## Cross-sprint guardrails

- Every PR includes a brand-checklist line item against ADR-0013.
- Every new migration is accompanied by an integration test that asserts RLS shape (read / write under anon, authenticated, owner, and service-role contexts).
- Every new mutating endpoint enforces and tests the idempotency-key contract (ADR-0009).
- The single source of truth for currency formatting is `lib/money/cents.ts` (ADR-0011) plus `lib/currency.ts` for legacy `numeric(10,2)` flows during the transition.
