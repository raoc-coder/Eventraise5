# Load tests (Sprint 5.5)

Requires [k6](https://k6.io/docs/get-started/installation/).

## Environment

```bash
export BASE_URL=https://www.eventraisehub.com   # or http://localhost:3000
export EVENT_ID=<published-event-uuid>
export AUCTION_ID=<auction-uuid>                # optional, for bid script
```

## Leaderboard viewers (target: 5k VUs)

Exercises `GET /api/events/:id/leaderboard` (same payload as the live page initial load).

```bash
k6 run scripts/load-test/k6-leaderboard.js
```

## Concurrent bidders (target: 1k VUs — sandbox only)

Requires auth tokens and registered bidders; extend `k6-auction-bids.js` with your test accounts before production-like runs.

```bash
# Stub — copy and fill BIDDER_TOKEN / LOT_ID
k6 run scripts/load-test/k6-auction-bids.js
```

## Interpreting results

- **http_req_duration p(95)** should stay under 2s for leaderboard at expected gala size.
- Watch Supabase **Realtime connections** during the test; compare to plan limits (ADR-0014).
- Log results in `docs/runbooks/sprint5-observability.md`.
