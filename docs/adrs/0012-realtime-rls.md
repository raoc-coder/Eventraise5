# ADR-0012: RLS-secured realtime, service-role write paths

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering, Security
- **Related:** ADR-0002, ADR-0008, ADR-0009

## Context

Realtime exposure of `bids` and `auction_lots` is a privacy and integrity concern. Bidder identities, paddle numbers, and unpublished auctions should never appear in a client subscription. At the same time, the bid write path needs strong authorization beyond what RLS alone provides (rate limiting, anti-fraud heuristics, anti-snipe extension, idempotency).

## Decision

- **Reads via Realtime are RLS-secured.** `postgres_changes` payloads must include only non-sensitive fields. The Realtime view (or column projection) for the `bids` channel exposes `id`, `lot_id`, `amount_cents`, `bidder_display`, `created_at`. It does not expose `bidder_id`, `client_idempotency_key`, or any PII.
- **Writes go through server API routes** under `app/api/auctions/.../bid/route.ts` using the `SUPABASE_SERVICE_ROLE_KEY` after an authn + authz check.
- The server route validates session, lot status, minimum increment, anti-snipe window, and idempotency before inserting into `public.bids`.
- Cross-channel: leaderboard updates use the same pattern with a sanitized projection.

## Alternatives considered

- **Public read on `bids`.** Rejected. Leaks user data and lets attackers map identities to amounts.
- **Allow client-side writes with RLS only.** Rejected. RLS cannot enforce business rules like anti-snipe or idempotency efficiently.

## Consequences

- Positive: privacy by construction; write path is the single source of business-rule enforcement.
- Negative: service-role key handling must be careful (server-only env scope).
- Operational: the service-role key must remain restricted to Edge Functions and server-only API routes; never bundled into client code.

## Compliance / acceptance criteria

- `SUPABASE_SERVICE_ROLE_KEY` is referenced only in `app/api/**` and `supabase/functions/**`.
- Realtime payload schema is asserted by a contract test (snapshot of allowed fields).
