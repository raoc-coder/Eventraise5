# ADR-0007: Anti-snipe auto-extension on late bids

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Product, Engineering
- **Related:** ADR-0002, ADR-0006

## Context

In silent and live auctions, last-second bids ("sniping") can discourage participation and suppress GMV. A widely accepted remedy is to extend a lot's close window when a bid is placed near the end. The mechanism must be predictable for organizers and bidders, and bounded so a lot cannot remain open indefinitely.

## Decision

When a bid is placed within **the last 60 seconds** before a lot's scheduled close, extend `auction_lots.closes_at` by **120 seconds**, up to a maximum of **5 extensions per lot**. Extensions are visible in the UI as a refreshed countdown and an info badge ("Lot extended").

- Default: **on** for live auctions.
- Default: **off** for silent auctions.
- Per-auction toggle is exposed on the organizer console.

## Alternatives considered

- **No extension.** Rejected. Encourages sniping and depresses GMV.
- **Unbounded extensions.** Rejected. Enables griefing and prevents organizers from closing on schedule.

## Consequences

- Positive: increased final-round participation; better GMV.
- Negative: organizers must communicate the rule clearly so it does not feel arbitrary.
- Operational: extensions are emitted on the auction broadcast channel (ADR-0002) so all clients see the new countdown immediately.

## Compliance / acceptance criteria

- The extension rule is enforced server-side, not by client logic.
- Each extension is logged on `public.auction_lots` (counter or audit table) and shown in the organizer console.
