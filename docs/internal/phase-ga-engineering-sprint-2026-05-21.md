# Phase GA — Engineering Sprint (internal recap)

**Sprint label:** Phase GA engineering (post–Sprint 5)  
**Date:** 2026-05-21  
**Production deploy:** **Successful** (Vercel)  
**Supabase project:** `yxzypekwyuopbanroobr`  
**Canonical URL:** `https://www.eventraisehub.com`

---

## Summary

This sprint closed **Phase GA P0 engineering gaps** from the ledger: OR §5.5 brand/a11y automation, production cron verification, and ops-script fixes for the apex→www redirect. **Platform decision:** remain on **Supabase** (Neon evaluated; not a drop-in replacement for Auth, Realtime, Edge/`pg_net`, Storage).

**Still open after deploy:** P0 outbid E2E smoke (needs a real bid in DB), Twilio 10DLC, PayPal Vault rehearsal, OR §5 manual sign-off, P2 k6/dashboards.

---

## Deliverables shipped

| ID | Deliverable | Location / command |
|----|-------------|-------------------|
| GA-1 | Bid sheet component + sticky mobile CTA (OR §4.4) | `components/auctions/LotBidForm.tsx`; wired in `app/auctions/[id]/lots/[lotId]/page.tsx` |
| GA-2 | Donate flow brand + CTA scarcity (OR §5.5) | `components/donations/DonationAmountForm.tsx`; `app/donations/new/page.tsx` slimmed |
| GA-3 | Automated axe gate | `__tests__/a11y/ga-critical-flows.test.tsx`; `npm run test:a11y` |
| GA-4 | Bid form unit test | `__tests__/components/auctions/LotBidForm.test.tsx` |
| GA-5 | `ga:status` www canonical probe | `scripts/ga-status.ts` — avoids false 401 on apex redirect |
| GA-6 | `p0:smoke` www host for cron drain | `scripts/p0-smoke-outbid.ts` |
| GA-7 | Docs / env hints | `docs/phase-ga-go-live.md`, `env.example` (www URL note) |
| GA-8 | Dependency | `jest-axe` (dev) |

---

## Production verification (post-deploy)

| Check | Result |
|-------|--------|
| `CRON_SECRET` on Vercel | Set (user confirmed) |
| `NEXT_PUBLIC_APP_URL` on Vercel | `https://www.eventraisehub.com` (user confirmed) |
| Prod cron drain | **HTTP 200** on `https://www.eventraisehub.com/api/cron/process-notification-deliveries` with Bearer `CRON_SECRET` |
| `npm run ga:status` | Cron probe **OK** (script uses www when local env shows apex) |
| `npm run test:a11y` | Pass — zero serious/critical on bid sheet + donate form |

**Note:** Requests to `https://eventraisehub.com/...` return **307 → www**; some clients drop `Authorization` on redirect. Always probe and document cron curls against **www**.

---

## Brand & accessibility (OR §5.5)

- **Thermometers:** unchanged in this sprint; existing `bg-action-500` on `Thermometer` / event pages (Sprint 5).
- **Donate presets:** `secondary` / `outline` (trust palette) — **not** action orange; PayPal remains the sole pay CTA.
- **Donate page:** removed `green-*` / ad-hoc `gray-*` in favor of `trust-*` tokens.
- **Bid page:** `aria-live` on current high; labeled bid input; sticky **Place bid** on viewports `< sm`.

---

## Architecture decision log

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Database vendor | **Stay on Supabase** | ERH uses Auth (`auth.users` + RLS), Realtime, Edge + `pg_net`, planned Storage; Neon is Postgres-only |
| Next platform cost win | Right-size Supabase + 10DLC when live | Avoid multi-vendor replatform for uncertain savings |

---

## Commands (copy/paste)

```bash
# Readiness
npm run ga:status
npm run validate
npm run test:a11y

# After first sandbox bid exists
npm run p0:smoke
npm run p0:smoke -- --drain-only

# Manual prod cron drain (www host)
source .env.local
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.eventraisehub.com/api/cron/process-notification-deliveries"
```

---

## Open backlog (unchanged priority)

| Priority | Item | Owner |
|----------|------|-------|
| P0 | Outbid E2E: bid → `notification_deliveries` → cron → push/in-app | Eng/QA |
| P0 | Twilio 10DLC **VERIFIED** | Ops |
| P1 | PayPal Vault sandbox E2E → live | Eng/Finance |
| P1 | OR §5 manual: Realtime latency, Web Push on device, dedupe replay | Eng/QA |
| P2 | k6 + observability dashboards per runbook | Eng |

---

## Related

- [`LEDGER.md`](../../LEDGER.md) — living status  
- [`docs/phase-ga-go-live.md`](../phase-ga-go-live.md) — master GA checklist  
- [`docs/adrs/operational-readiness.md`](../adrs/operational-readiness.md) — §5–§6 gates  
