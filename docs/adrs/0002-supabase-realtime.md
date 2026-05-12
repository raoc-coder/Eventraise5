# ADR-0002: Supabase Realtime for live auctions and leaderboards

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Tech lead
- **Related:** ADR-0008, ADR-0012, ADR-0014

## Context

User Story 2.2 requires sub-second feedback when a bidder is outbid. User Story 1.2 requires live leaderboards across teams and personal campaigns. The codebase already uses `@supabase/supabase-js`, which ships a Realtime client supporting `postgres_changes` (logical replication of row inserts/updates/deletes) and `broadcast` (server-published events not tied to a row change). Adding a new vendor for realtime would expand the surface area, the auth model, and the cost.

## Decision

Use **Supabase Realtime** as the live transport for auctions and leaderboards.

- `postgres_changes` on `bids` and `auction_lots` for canonical state.
- `broadcast` for system events that are not row inserts (lot-close countdown, anti-snipe extension, "lot is now live").
- One channel per `auction_id`; one channel per `event_id` for leaderboards.

## Alternatives considered

- **Ably / Pusher.** Rejected. Adds vendor, monthly cost, and a second auth surface.
- **Custom WebSocket service on Vercel or Fly.** Rejected. Reimplements fan-out, retry, and presence; high build/maintenance cost.
- **Long polling.** Rejected as a primary transport. Useful only as a fallback degradation mode.

## Consequences

- Positive: zero new vendors; channels inherit RLS (see ADR-0012); cost included in the current Supabase tier.
- Negative: concurrent-connection ceilings vary by Supabase tier and must be sized for the largest gala (see ADR-0014). Realtime cannot replace authoritative server writes — bids still go through a server API route (see ADR-0009 and ADR-0012).
- Operational: confirm Realtime plan capacity before the first booked gala.

## Compliance / acceptance criteria

- All new live-update UI subscribes through helpers under `lib/realtime/`.
- Realtime payloads expose only non-sensitive fields (for example, `amount_cents`, `lot_id`, `bidder_display`); no user IDs or emails.
