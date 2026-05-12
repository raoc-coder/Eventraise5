# ADR-0014: Observability and outbid SLOs

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** SRE, Engineering
- **Related:** ADR-0002, ADR-0008, OBSERVABILITY_SETUP.md

## Context

Outbid latency is a brand-defining metric. If a bidder discovers they were outbid only after the gala has moved on, the platform's GMV and trust suffer. Latency is the joint product of database trigger, Edge Function execution, third-party delivery, and client receipt — so it must be measured end-to-end.

## Decision

Track and alert on the following metrics in Sentry and PostHog:

- `bid_accepted` (server timestamp on insert into `public.bids`).
- `notification_deliveries.status = 'sent'` per channel.
- `notification_received` (client-side beacon when the user actually sees the outbid alert).

**SLOs:**

- **Push** outbid p95 ≤ **2.0 seconds** from `bid_accepted` to `notification_deliveries.sent`.
- **SMS** outbid p95 ≤ **5.0 seconds** from `bid_accepted` to `notification_deliveries.sent` (Twilio DLR).
- **Email** outbid p95 ≤ **30.0 seconds** to `delivered` event from SendGrid.

Dashboards exist in PostHog (funnel + cohort views) and Sentry (releases + perf). Alerts fire on SLO breach during live auction windows.

## Alternatives considered

- **Measure server-only latency.** Rejected as primary. End-to-end is the user truth.
- **No SLO.** Rejected. The whole product premise depends on this metric.

## Consequences

- Positive: a single dashboard tells us whether the brand promise is being kept.
- Negative: requires lightweight client beacons (small bundle delta).
- Operational: dashboards owned by the Engineering Lead; alerts route to on-call during scheduled gala windows.

## Compliance / acceptance criteria

- An SLO dashboard exists before the first scheduled live auction.
- Alerts are tested with a synthetic bidder before each booked gala.
