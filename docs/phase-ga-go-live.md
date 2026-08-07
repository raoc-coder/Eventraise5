# Phase GA — Go-live & first live event

**Status:** Active (post–Sprint 5)  
**Started:** 2026-05-21  
**Authoritative gates:** [`docs/adrs/operational-readiness.md`](./adrs/operational-readiness.md) §5 (Sprint 4 GA), §6 (per-event)  
**Living log:** [`LEDGER.md`](../LEDGER.md)  
**Observability:** [`docs/runbooks/sprint5-observability.md`](./runbooks/sprint5-observability.md)

The locked sprint plan ends at **Sprint 5**. There is **no Sprint 6** in [`docs/sprint-plan.md`](./sprint-plan.md). This phase is **ops, rehearsal, and sign-off** — not new epic scaffolding.

**Security follow-on:** After the 2026-08-07 platform audit, use [`docs/phase-audit-hardening.md`](./phase-audit-hardening.md) for **P0 ops + Sprints 6–8** (auth, money integrity, defense in depth). Ticketed / high-volume donation events should wait for that plan’s Sprint 7 exit.

---

## Program position

| Sprints 0–5 (Epics 1–2) | Phase GA |
|-------------------------|----------|
| **Engineering complete** in repo | **Verification + production env** |
| Migrations `021`–`032` on `yxzypekwyuopbanroobr` | Walk OR §5–§6 checklists |
| Platform admin console shipped (`032`) | First booked gala rehearsal |

---

## Workstreams (ordered)

### P0 — Outbid path live

| # | Task | Done when |
|---|------|-----------|
| 1 | Edge `notify-outbid` deployed | HTTP 404 `bid_not_found` on fake id (not 401) |
| 2 | Vault secrets `notify_outbid_*` | `npm run p0:vault` succeeds |
| 3 | `pg_net` + `bids` trigger (`027`) | Trigger exists on linked project |
| 4 | **`CRON_SECRET` on Vercel** (Production + Preview) | `npm run ga:status` → prod cron **200** on `www` host |
| 5 | End-to-end smoke | Real bid → `notification_deliveries` → cron drain → push/in-app |

**Scripts:** `npm run p0:vault`, `npm run p0:smoke`, `npm run ga:status`

**Vercel (manual — no CLI in repo):** Project → Settings → Environment Variables → add `CRON_SECRET` with the **same value** as `.env.local` for Production, Preview, and Development. Redeploy.

**Local cron drain:**

```bash
npm run dev
# other terminal:
npm run p0:smoke -- --drain-only
# or:
curl -sS -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/process-notification-deliveries
```

### P0 — Twilio 10DLC (external)

| # | Task | Status |
|---|------|--------|
| 1 | Campaign **VERIFIED** + brand **APPROVED** | **Complete** (2026-06-07) |
| 2 | Test US outbid SMS | Pending |
| 3 | STOP/HELP on Messaging Service | Pending |

Does **not** block: Verify login, Web Push, admin console static login.

### P1 — Payments & auctions

| # | Task |
|---|------|
| 1 | PayPal Vault sandbox E2E → live credentials on Vercel — **Option B complete** on Vercel (2026-06-07); Option A pending — [`docs/runbooks/paypal-vault-rehearsal.md`](./runbooks/paypal-vault-rehearsal.md) |
| 2 | Lot close → `sweep-auction-lots` → `paypal_capture_id` — **Complete** (practice path) |
| 3 | Organizer console + CSV on a real auction |

### P1 — Sprint 4 GA checklist (OR §5)

Walk §5.0–§5.5 in operational-readiness.md (Realtime, anti-snipe, push, dedupe, axe, brand).

**Automated in CI/repo:** `npm run test:a11y` — axe on bid sheet + donate form; brand CTA scarcity on donate presets.

### P2 — Load & observability (Sprint 5 ops)

| # | Task |
|---|------|
| 1 | `scripts/load-test/k6-leaderboard.js` |
| 2 | `scripts/load-test/k6-auction-bids.js` (sandbox) |
| 3 | Record p95 in sprint5 observability runbook |
| 4 | Wire Sentry / Vercel / PostHog per runbook |

### Per-event (OR §6)

T-24h, T-1h, during event, T+1h — see operational-readiness §6.

---

## Platform admin (parallel)

- `/admin/login` — email + phone + `PLATFORM_ADMIN_PASSWORD`
- Set `PLATFORM_ADMIN_PASSWORD` on Vercel with `.env.local` value
- Roster: migration `032` / `/admin/admins`

---

## Optional future (“Sprint 6+”)

Not scheduled until after first gala:

- Broadcast channels for leaderboard / donor wall
- Full `numeric` → `_cents` migration
- Load test at 1.5× booked concurrency
- Post-event organizer report

---

## Quick commands

```bash
npm run validate          # lint + tsc + unit tests
npm run ga:status         # env + DB + cron smoke summary
npm run p0:smoke          # Edge + pending deliveries + cron drain
npm run paypal:rehearsal  # vault practice E2E + optional --check / --sweep / --cleanup
npm run paypal:seed       # open lot for Vercel browser rehearsal
```

PayPal vault runbook: [`docs/runbooks/paypal-vault-rehearsal.md`](./runbooks/paypal-vault-rehearsal.md)
