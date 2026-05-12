# ADR-0009: Client-supplied idempotency keys for writes

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering
- **Related:** ADR-0002, ADR-0006, ADR-0012

## Context

Mobile networks retry. Users double-tap. Live auction bidding amplifies both. Without idempotency, a single tap can produce duplicate bids or donations, which corrupts totals, fees, and trust. Server-side deduplication based on `(user, amount, ~timestamp)` is fragile across retries and clock skew.

## Decision

Every mutating client call carries a **client-supplied `idempotency_key`** (UUIDv7 or ULID). The server enforces uniqueness with a database constraint scoped to the resource. A replay returns the prior result rather than creating a duplicate.

- `public.bids` uses `unique (lot_id, client_idempotency_key)`.
- `public.donations` (new writes) uses a paired uniqueness constraint scoped to `(campaign_id, client_idempotency_key)`, retrofitted only on new write paths; existing flows are unchanged.
- `public.notification_deliveries` uses `unique (user_id, dedupe_key, channel)` (see ADR-0008).

## Alternatives considered

- **Server-side dedupe on `(user, amount, time-bucket)`.** Rejected. Race-prone and lossy.
- **No idempotency, with client-side debouncing only.** Rejected. Network retries bypass client debouncing.

## Consequences

- Positive: drastically reduces duplicates and refund work.
- Negative: the client must generate and persist keys for in-flight retries (a small but real complexity).
- Operational: API responses include the canonical resource identifier so the client can reconcile after a replay.

## Compliance / acceptance criteria

- 100 percent of new mutating endpoints (`/api/auctions/.../bid`, `/api/personal-campaigns`, `/api/teams`, donation writes added in Sprint 2) accept and require `idempotency_key`.
- Integration tests cover the "duplicate post returns prior result" case for each endpoint.
