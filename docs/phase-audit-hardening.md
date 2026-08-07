# Phase Audit Hardening — Sprint Phase Plan

- **Status:** **Engineering complete (2026-08-07)** — Sprints 6–8 on `main`; P0 ops residual (migrations 033/034, webhook ID, password rotate) still required for production hardened claim
- **Cadence:** 1-week phases (P0 ops gate) then **2-week sprints** (S6–S8)
- **Cadence:** 1-week phases (P0 ops gate) then **2-week sprints** (S6–S8)
- **Source of truth (findings):** [`docs/PLATFORM_AUDIT_2026-08-07.md`](./PLATFORM_AUDIT_2026-08-07.md)
- **P0 runbook:** [`docs/runbooks/audit-p0-ops-gate.md`](./runbooks/audit-p0-ops-gate.md)
- **Code already on `main`:** Critical C1–C5 + selected High/Medium remediations (commit `88ab3ac`)
- **Does not replace:** Locked Epics 1–2 plan ([`docs/sprint-plan.md`](./sprint-plan.md)) or Phase GA ([`docs/phase-ga-go-live.md`](./phase-ga-go-live.md)) — this phase runs **in parallel / immediately after** GA ops for security debt
- **Conventions:** same as locked sprint plan (migrations ADR-0001, integer cents ADR-0011, idempotency ADR-0009, PayPal-only ADR-0016)

---

## Program position

| Before | This phase |
|--------|------------|
| Audit found Critical risk; code fixes landed on `main` | **Make fixes live** + close remaining High/Medium |
| Migration `033` written, **not necessarily applied** in Supabase | Ops gate blocks “hardened” claim until applied |
| Phase GA = rehearsal / first live event | Audit hardening = **security & money-path integrity** |

```mermaid
flowchart LR
  A[Audit code on main] --> B[P0 Ops gate]
  B --> C[Sprint 6 Auth & edge]
  C --> D[Sprint 7 Money integrity]
  D --> E[Sprint 8 Defense in depth]
  E --> F[Hardening exit / GA resume]
```

---

## Exit criteria (phase complete when all true)

1. Migration `033` applied on staging **and** production; smoke checks in P0 pass.
2. No open **High** findings from the audit remain (H2, H3, H6, H8 closed or accepted with written waiver in LEDGER).
3. Money-path races (M2, M6, M9 inventory) mitigated with unique constraints + conditional updates + tests.
4. Durable rate limit store used for auth, SMS share, admin login, cashout.
5. Authz regression tests cover create-order tickets, register, payouts, cashout.
6. `npm run validate` green; PayPal sandbox rehearsal still passes (`npm run paypal:rehearsal`).

---

## P0 — Ops gate (1 week, blocking)

**Goal:** Deploy the audit remediations that only work after DB/env work. No new features.

| # | Deliverable | Owner | Done when | Status |
|---|-------------|-------|-----------|--------|
| P0.1 | Apply `033_security_hardening.sql` on **staging** | Ops / Eng | Triggers exist; client cannot `UPDATE profiles.role`; `paypal_orders` client INSERT denied | **Tooling ready** — `npm run audit:p0:apply` (needs `supabase login`) |
| P0.2 | Apply `033` on **production** | Ops | Same checks on prod project | **Pending** apply (same linked project as staging today) |
| P0.3 | Set `PAYPAL_WEBHOOK_ID` on Vercel (Production + Preview) | Ops | Webhook verify succeeds; `PAYPAL_WEBHOOK_SKIP_VERIFY` **unset** in prod | **Pending** — tracked by `audit:p0:status` |
| P0.4 | Audit `profiles.role = 'admin'` rows | Eng + Owner | Spreadsheet of rows; revoke any not tied to `platform_admins` / `OWNER_*` | **Scripted** — `audit:p0:status` + `scripts/sql/audit-p0-role-audit.sql` |
| P0.5 | Rotate `PLATFORM_ADMIN_PASSWORD` | Ops | New secret in Vercel; old password fails login | **Pending** (manual — do not commit secret) |
| P0.6 | Manual smoke (staging) | Eng / QA | (1)–(5) per plan | **Partial** — `npm run audit:p0:smoke`; auth’d payout/cashout still manual |

**Exit:** P0.1–P0.6 complete → start Sprint 6.  
**Rollback:** Keep previous migration backup; password rotate is one-way — store new secret in password manager first.

---

## Sprint 6 — Auth & edge controls (2 weeks)

**Goal:** Close remaining **High** auth findings (H2, H3, H6, H8).  
**Status:** **Complete in repo (2026-08-07)** — set Upstash env on Vercel for durable limits; optional `PLATFORM_ADMIN_USE_TWILIO=true` for OTP+password admin flow.

| # | Finding | Deliverable | Done when | Status |
|---|---------|-------------|-----------|--------|
| S6.1 | H2 | Cookie-only admin sessions; Twilio OTP+password path wired | No `refresh_token` in JSON; `/api/admin/auth/send|check` implemented | **Done** |
| S6.2 | H3 | Phone OTP must not mint platform-admin session | `/api/auth/verify/check` uses phone user only (ADR-0018) | **Done** |
| S6.3 | H6 | Durable rate limit via Upstash REST behind `lib/rate-limit.ts` | Env optional; memory fallback; all callers async | **Done** |
| S6.4 | H8 | `middleware.ts` for auth/admin-auth/SMS share + security headers | Matcher live | **Done** |
| S6.5 | — | ADR-0018 platform admin authentication | Accepted in `docs/adrs/` | **Done** |
| S6.6 | — | Tests: elevation negative + rate limit memory | Jest green | **Done** |

**Out of scope:** Redesigning organizer UX; new payment providers.

**Exit:** H2/H3/H6/H8 closed or LEDGER waiver; admin login rehearsal on staging.

---

## Sprint 7 — Money-path integrity (2 weeks)

**Goal:** Close payment/ledger Medium findings that can cause undercharge, oversell, or double credit.  
**Status:** **Complete in repo (2026-08-07)** — apply migration `034` on Supabase for unique indexes + inventory RPC + vault setups.

| # | Finding | Deliverable | Done when | Status |
|---|---------|-------------|-----------|--------|
| S7.1 | M2 | Capture amount reconciled vs `paypal_orders.amount_cents` | Mismatch → 409 | **Done** |
| S7.2 | M6 | Shared `settlePaypalCapture` + unique capture indexes; conditional pending→captured | Capture API + webhook share writer | **Done** |
| S7.3 | M9 | `increment_event_ticket_sold` RPC | Atomic inventory on settle | **Done** |
| S7.4 | M9 | `auction_vault_setups` bind + register rejects client tokens | Vault confirm only | **Done** |
| S7.5 | — | `lib/money/fees.ts` integer-cents fees on create-order / checkout | ADR-0011 aligned | **Done** |
| S7.6 | — | Unit tests for fees + wiring guards | Jest green | **Done** |

**Out of scope:** Changing platform fee %.

**Exit:** Sandbox donation + ticket + P2P attribution rehearsal with forced double-webhook shows single credit; inventory stress (parallel requests) holds.

---

## Sprint 8 — Defense in depth & hygiene (2 weeks)

**Goal:** Remaining Medium/Low surfaces, observability, and regression harness.  
**Status:** **Complete in repo (2026-08-07)** — engineering closeout; ops residual listed in LEDGER.

| # | Finding | Deliverable | Done when | Status |
|---|---------|-------------|-----------|--------|
| S8.1 | M4 | `validateAppUrl` + `npm run audit:cors` + `ga:status` CORS line; next.config uses origin only | No wildcards | **Done** |
| S8.2 | M5 | `/api/health/advanced` public liveness; details need CRON_SECRET or platform admin | Anon stripped | **Done** |
| S8.3 | L stubs | AI/insights/impact/templates/verification → **410** | No organizer echo | **Done** |
| S8.4 | — | `__tests__/lib/sprint8-defense.test.ts` authz/wiring guards | Jest green | **Done** |
| S8.5 | — | `SECURITY_COMPLIANCE.md` + LEDGER updated | Docs match | **Done** |
| S8.6 | — | Phase marked engineering-complete; ops checklist residual | See LEDGER | **Done** |

**Exit:** Phase exit criteria §1–6 all true.

---

## Workstream ownership (suggested)

| Stream | Primary | Supports |
|--------|---------|----------|
| Ops / env / migrations | Ops | Eng |
| Admin auth & middleware | Eng | Security-minded review |
| PayPal capture / inventory | Eng | Finance sign-off on fee cents |
| Tests & docs | Eng | QA |

---

## Dependency map

| Item | Blocks |
|------|--------|
| P0.1–P0.2 (migration 033) | Claiming M7/M8 closed in production |
| P0.3 (webhook id) | Trusting webhook-driven settlements |
| S6.3 (durable rate limit) | Meaningful SMS/auth abuse control on Vercel |
| S7.1–S7.2 | Safe high-traffic gala donation bursts |
| S7.3 | Ticketed events at scale |

Phase GA first-live-event rehearsals **may continue** during S6–S8, but **ticketed + high-volume donation events should wait for Sprint 7 exit**.

---

## Tracking

| Artifact | Role |
|----------|------|
| [`docs/PLATFORM_AUDIT_2026-08-07.md`](./PLATFORM_AUDIT_2026-08-07.md) | Finding IDs (C/H/M) |
| This document | Sprint backlog & exit gates |
| [`LEDGER.md`](../LEDGER.md) | Dated progress (update each sprint exit) |
| [`docs/internal/qa-admin-runbook-10dlc-pending.md`](./internal/qa-admin-runbook-10dlc-pending.md) | Admin QA after S6 auth changes |

### Suggested LEDGER entries (copy when starting)

```text
## Phase Audit Hardening
- P0 ops gate: migration 033 / PAYPAL_WEBHOOK_ID / role audit / password rotate
- Sprint 6: admin auth + durable rate limit + middleware
- Sprint 7: capture reconcile + idempotent donations + atomic tickets + vault bind
- Sprint 8: health/CORS/stubs + authz tests + docs closeout
```

---

## Explicitly out of scope

- New fundraising product epics (beyond security fixes)
- Reintroducing Stripe/Braintree
- Full SOC2 evidence pack (use this phase as input later)
- Redesign of marketing/demo UI under `app/demo/`
