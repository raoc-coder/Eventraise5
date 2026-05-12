# ADR-0011: Integer cents for all new monetary columns

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering
- **Related:** ADR-0001, ADR-0006

## Context

Auction bid increments and authorization holds are arithmetic-heavy. The existing `donations.amount` column is `numeric(10,2)`, which is fine for a single donation total but produces drift and rounding bugs when many additions, subtractions, and percentage calculations occur per second (live bidding plus matching-gift evaluation plus fee math).

## Decision

All **new** monetary columns introduced by Epic 1 and Epic 2 use **integer cents**, named with the suffix `_cents`. Existing `donations.amount` and `campaigns.current_amount` remain `numeric(10,2)`; they are not migrated.

Examples in the proposed schema:

- `auction_lots.start_price_cents`
- `auction_lots.reserve_price_cents`
- `auction_lots.current_high_bid_cents`
- `bids.amount_cents`
- `auctions.min_increment_cents`

## Alternatives considered

- **Migrate everything to cents.** Rejected. Touches every read path of donations, payouts, and reporting for no immediate gain.
- **Stay on `numeric(10,2)` for the new tables.** Rejected. Aggregating thousands of bids per minute is exactly the workload where integer math wins.

## Consequences

- Positive: deterministic arithmetic, fewer rounding bugs.
- Negative: temporary co-existence of two conventions in the codebase; mitigated by always casting through a single `lib/money/` helper.
- Operational: a single helper module formats and parses cents-to-display strings consistently and is used by both the auction UI and reports.

## Compliance / acceptance criteria

- No floating-point arithmetic appears in auction code paths.
- All currency-display strings flow through one helper for locale and formatting.
