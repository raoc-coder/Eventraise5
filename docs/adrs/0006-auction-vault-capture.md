# ADR-0006: Vault payment method, capture on auction win

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering, Finance, Product
- **Related:** ADR-0009, ADR-0014

## Context

Auction galas need a fast, low-friction bidding experience without sacrificing collectability of winning bids. Two patterns are common: capture at bid time (high friction, poor UX), or invoice after the event (high no-pay risk and operational drag). A vault + capture-on-win flow strikes the balance: the bidder agrees to a vaulted payment method during auction registration, and we capture only the winning amount(s) on lot close.

## Decision

Use a **vault + capture-on-win** flow for auction lots.

- At auction registration, vault a payment token via PayPal (and Braintree where still applicable). Store **only the token reference** on `public.auction_registrations.payment_method_token` — never raw card data.
- Optionally authorize a hold at registration (configurable per auction).
- On lot close with a winning bid, the closing job captures the winning amount and writes to `public.notification_deliveries` for the "you won" notification.
- Authorizations are valid for roughly 29 days with PayPal; the close-and-capture job must run promptly. A Vercel Cron sweep also runs every minute during live auction windows.

## Alternatives considered

- **Capture at bid time.** Rejected. Bad UX, fee multiplication on outbid users, and unnecessary refunds.
- **Invoice after the event.** Rejected. Historically yields significant unpaid winners and operational chase.

## Consequences

- Positive: high collectability with low bid-time friction.
- Negative: requires careful handling of authorization expiry, refunds, and partial captures.
- Operational: PayPal vaulting and webhooks for `PAYMENT.AUTHORIZATION.*`, `PAYMENT.CAPTURE.*`, and `VAULT.PAYMENT-TOKEN.*` must be confirmed.

## Compliance / acceptance criteria

- No PAN, CVV, or full card data is ever stored in our database.
- All winning captures are idempotent (ADR-0009) and observable in Sentry / PostHog.
