# ADR-0016: Sunset Braintree — PayPal-only payments

- **Status:** Accepted
- **Date:** 2026-05-12
- **Supersedes:** Sprint 0 item "S0.7 — decision on Braintree (keep / sunset / remove)" — decision is now **sunset** (management authorization).

## Context

EventraiseHub historically carried a dual payment stack: PayPal (Orders v2, donations, tickets) and Braintree (hosted checkout, client token, server SDK). That split increased operational surface area (two PCI scopes, two webhook models, two failure modes) and slowed Epic 2 (auction vault + capture-on-win) because every payment path had to be reasoned about twice.

Management has **authorized complete removal** of the Braintree dependency. All net-new and maintained payment flows shall use **PayPal only**, consistent with ADR-0006 (vault + capture on auction win) and the existing donation/ticket flows.

## Decision

1. **Braintree is sunset.** Remove `braintree`, `braintree-web`, and `braintree-web-drop-in` from application dependencies after a parity checklist (below) passes.
2. **Default payment integration is PayPal** for donations, tickets, and (Sprint 3+) auction registration / vaulting.
3. **Legacy Braintree API routes** under `app/api/braintree/**` shall be removed or return a single consistent `410 Gone` with a pointer to PayPal flows — no silent partial behavior.
4. **Database columns** such as `donation_requests.braintree_transaction_id` remain **read-only legacy** until a follow-up migration explicitly deprecates or drops them (optional, low priority); no new writes to Braintree IDs.

## Alternatives considered

- **Keep Braintree for "enterprise" orgs** — Rejected: doubles compliance and support cost; management mandated single processor.
- **Migrate to Stripe** — Rejected for this phase; out of scope relative to locked PayPal + ADR-0006.

## Consequences

- **Positive:** Smaller bundle, fewer env vars, one mental model for eng + support, faster Epic 2 delivery.
- **Negative:** Any customer still bookmarking `/payment/braintree` or old Braintree-only flows will need redirects to PayPal equivalents; document in release notes.
- **Execution:** **Sprint 0.7** completed in-repo **2026-05-13** (`docs/sprint-plan.md`). Next product sprint: **Sprint 2** (Epic 1 completion).

## Parity checklist (Sprint 0.7 — **complete** 2026-05-13)

- [x] Donations: `/donations/new` + PayPal path unchanged (smoke: `npm run build`; manual PayPal in staging still recommended).
- [x] Tickets: PayPal ticket button path unchanged (no Braintree imports removed from ticket flow).
- [x] No production code path imports removed Braintree modules (files deleted).
- [x] Cypress / E2E: no assertion **requires** `/payment/braintree`; URLs must not include `braintree`.
- [x] `scripts/setup-env.js` and `env.example`: Braintree env prompts removed; PayPal documented.
- [x] `jest.setup.js` / comments: stale Braintree line updated.
- [x] `lib/monitoring.ts`: `processor` type is `paypal`.
- [x] `app/api/webhooks/braintree/route.ts`: single `410` stub with JSON body.

## Historical inventory (pre-removal grep baseline)

| Area | Files / notes |
|------|-----------------|
| Dependencies | `package.json`: `braintree`, `braintree-web`, `braintree-web-drop-in`; dev: `@types/braintree-web` |
| Server lib | `lib/braintree-server.ts` |
| Client lib | `lib/braintree-client.ts` |
| Hook | `hooks/use-braintree-checkout.ts` |
| Types | `types/braintree.d.ts` |
| API routes | `app/api/braintree/[[...path]]/route.ts` → `410`; `app/api/webhooks/braintree/route.ts` → `410` |
| Payouts API | `app/api/payouts/donations/route.ts` — selects `paypal_order_id`, `paypal_capture_id`, `personal_campaign_id` (with schema fallbacks) |
| Migrations status | `app/api/migrations/status/route.ts` — probes `donation_requests.paypal_order_id` |
| Cypress | `cypress/e2e/*.cy.ts` — assertions do **not** require `/payment/braintree` |
| Setup script | `scripts/setup-env.js` |

## Compliance

- All new payment features reference **ADR-0006** and **ADR-0009** (idempotency); Braintree must not reappear without a new ADR superseding this one.

## Execution log

| Date | Environment | Note |
|------|---------------|------|
| 2026-05-13 | `eventraise` repo | Removed npm deps, deleted `lib/braintree-*`, `hooks/use-braintree-checkout`, `types/braintree.d.ts`; replaced `app/api/braintree/*` with optional catch-all `410`; updated payouts, Cypress, `env.example`, `setup-env.js`, `jest.setup.js`, `lib/monitoring.ts`; `npm test` + `npm run build` green. |

## Related

- ADR-0006 — Auction vault + capture
- ADR-0011 — Integer cents
- [`../sprint-plan.md`](../sprint-plan.md) — Sprint 0.7 execution table
