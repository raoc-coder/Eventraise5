# Sprint 5 — Observability & load testing runbook

**Related:** ADR-0014 (SLOs), Operational Readiness §5–§6.

## Dashboards (freeze before first booked gala)

| Panel | Source | Alert threshold (initial) |
|-------|--------|---------------------------|
| Outbid delivery latency | `notification_deliveries.sent_at - created_at` | p95 > 30s for 15m |
| Outbid failure rate | `status = failed` / processed | > 5% over 1h |
| Realtime connections | Supabase dashboard → Realtime | > 80% of plan cap |
| Auction bid API 5xx | Vercel / Sentry | > 1% over 5m |
| Leaderboard API p95 | Vercel Analytics | > 2s sustained |

## Alert policies

1. **Pager (production):** cron `process-notification-deliveries` returns non-200 twice in a row; PayPal capture sweep failures > 10 in one run.
2. **Slack (warning):** Realtime channel errors logged from `lib/realtime/*`; Twilio SMS send failures when 10DLC is verified.
3. **Daily digest:** pending `notification_deliveries` count > 100.

## Load test rehearsal

See `scripts/load-test/README.md`. Target before GA:

- 1k concurrent simulated bidders (bid API + Realtime lot subscribers)
- 5k leaderboard viewers (Realtime `personal_campaigns` / `teams` + donor wall)

Record Supabase Realtime connection peak and Vercel function duration p95 in this doc after each rehearsal.

## Per-event rehearsal checklist

- [ ] Leaderboard updates without full page reload when a test donation succeeds
- [ ] Donor wall shows new gift within Realtime + API path
- [ ] Thermometer pulse on `/p/[slug]` after donation
- [ ] Bid sheet `aria-live` announces new high bid
- [ ] Cron notification drain healthy (`GET /api/cron/process-notification-deliveries`)
