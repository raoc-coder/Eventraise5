# Architecture Decision Records (ADRs)

This folder holds the locked architecture decisions for EventraiseHub.
The first batch (ADR-0001 through ADR-0015) was approved on **2026-05-12** and represents the **Sprint 0 baseline** for Epics 1 (Peer-to-Peer) and 2 (Auctions + Real-Time Bidding).
**ADR-0016** (Braintree sunset — PayPal-only) was accepted on **2026-05-12** per management authorization; execution is tracked as **Sprint 0.7** in `docs/sprint-plan.md`.

## Conventions

- Format: short MADR-inspired template (`_template.md`).
- Numbering: 4-digit, zero-padded, monotonically increasing.
- Status values: `Proposed | Accepted | Superseded by ADR-XXXX | Deprecated`.
- One decision per file. If the decision changes, **do not edit** the accepted ADR — create a new ADR and mark the old one `Superseded by ADR-XXXX`.
- Filenames: `NNNN-short-kebab-title.md`.

## Index (locked baseline + payment processor lock)

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-supabase-sql-migrations.md) | Use Supabase SQL migrations (no ORM swap) | Accepted |
| [0002](./0002-supabase-realtime.md) | Supabase Realtime for live auctions and leaderboards | Accepted |
| [0003](./0003-web-push-vapid.md) | Self-hosted Web Push via VAPID for browser push | Accepted |
| [0004](./0004-twilio-sms.md) | Twilio for SMS outbid alerts and notifications | Accepted |
| [0005](./0005-sendgrid-email.md) | SendGrid for transactional email (reuse existing) | Superseded by ADR-0017 |
| [0006](./0006-auction-vault-capture.md) | Vault payment method, capture on auction win | Accepted |
| [0007](./0007-anti-snipe-extension.md) | Anti-snipe auto-extension on late bids | Accepted |
| [0008](./0008-supabase-edge-functions.md) | Supabase Edge Functions for notification fan-out | Accepted |
| [0009](./0009-idempotency-keys.md) | Client-supplied idempotency keys for writes | Accepted |
| [0010](./0010-auth-model.md) | Authentication model for bidders and donors | Accepted |
| [0011](./0011-integer-cents.md) | Integer cents for all new monetary columns | Accepted |
| [0012](./0012-realtime-rls.md) | RLS-secured realtime, service-role write paths | Accepted |
| [0013](./0013-brand-ux-governance.md) | Trust 70 / Action 30 brand governance | Accepted |
| [0014](./0014-observability-slos.md) | Observability and outbid SLOs | Accepted |
| [0015](./0015-image-hosting.md) | Supabase Storage for auction lot imagery | Accepted |
| [0016](./0016-braintree-sunset.md) | Sunset Braintree — PayPal-only payments | Accepted |
| [0017](./0017-twilio-verify-phone-auth.md) | Twilio Verify for phone-only authentication | Accepted |

## How to propose a new ADR

1. Copy `_template.md` to the next number, e.g. `0016-my-decision.md`.
2. Open a PR with status `Proposed`.
3. On approval, update status to `Accepted` and add the row to the index in this README.
4. If it replaces an earlier ADR, mark that ADR `Superseded by ADR-XXXX` in a follow-up PR.

## Operational Readiness

- [`operational-readiness.md`](./operational-readiness.md) — master go-live checklist that maps the ADRs to concrete gates per Sprint and per live event. Walk this before unlocking any Sprint exit or authorizing a booked event.

## Related documents

- [`../sprint-plan.md`](../sprint-plan.md) — locked Sprint schedule for Epics 1 and 2; every Sprint exit criterion references a section of `operational-readiness.md`.
- `DESIGN_SYSTEM.md` and `DESIGN_SYSTEM_GUIDE.md` (existing) for the brand-system specifics referenced by ADR-0013.
- `SUPABASE_MIGRATION.md` (existing) for migration conventions referenced by ADR-0001.
- `OBSERVABILITY_SETUP.md` (existing) for the platform that backs ADR-0014.
