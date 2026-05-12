# ADR-0008: Supabase Edge Functions for notification fan-out

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering
- **Related:** ADR-0003, ADR-0004, ADR-0005, ADR-0014

## Context

Outbid notifications must be sent within seconds of a bid being accepted. Each notification fans out to multiple channels (push, SMS, email, in-app) with per-user preferences, retries, and deduplication. The dispatcher must be close to the database (low latency on lookup), horizontally scalable, and isolated from the Next.js request lifecycle.

## Decision

Use a **Supabase Edge Function** named `notify-outbid` for fan-out.

- Triggered by a database **trigger** on insert into `public.bids`, which calls `pg_net` to POST to the function URL with `{ bid_id, lot_id }`.
- The function resolves the **previous high bidder**, loads their preferences, and writes one row per `(user_id, channel)` to `public.notification_deliveries` with an idempotent `dedupe_key` such as `outbid:{lot_id}:{user_id}:{sequence}`.
- Channel-specific sub-functions handle delivery: `notify-push`, `notify-sms`, `notify-email`. Retries use exponential backoff with a maximum attempt count.
- A second Edge Function `notify-lot-closing` is invoked by Vercel Cron during live windows.

## Alternatives considered

- **Next.js API route worker subscribed to Realtime.** Rejected. Couples runtime to web traffic; less isolated; weaker delivery semantics.
- **Self-hosted queue (BullMQ / SQS).** Rejected for the initial implementation. Adds infrastructure and operational burden disproportionate to the scope.

## Consequences

- Positive: low end-to-end latency; isolated runtime; horizontal scale.
- Negative: requires `pg_net` extension enabled on Supabase; one more deployable surface.
- Operational: function URL and signing secret stored in environment variables; logs aggregated in Sentry via `@sentry/nextjs`-compatible SDK or `console` + Supabase log drain.

## Compliance / acceptance criteria

- Every delivery has a unique `(user_id, dedupe_key, channel)` row in `public.notification_deliveries`.
- A retry never produces a second outbound message for the same dedupe key.
- p95 from `bids.created_at` to `notification_deliveries.status = 'sent'` is monitored (ADR-0014).
