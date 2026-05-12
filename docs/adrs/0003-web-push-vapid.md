# ADR-0003: Self-hosted Web Push via VAPID for browser push

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering
- **Related:** ADR-0004, ADR-0008

## Context

US 2.2 mandates that an outbid user is notified within seconds. Push notifications give the best latency and conversion when a user has left the bidding tab. The W3C Push API combined with VAPID (Voluntary Application Server Identification) is supported by Chrome, Edge, Firefox, and Safari 16.4+. There is no need to introduce a third-party broker that would receive bidder PII.

## Decision

Implement **Web Push with VAPID** end-to-end:

- A service worker registered from `/sw.js` (or `app/sw.ts` under the App Router conventions).
- A subscription persisted in `public.push_subscriptions` (`user_id`, `endpoint`, `p256dh`, `auth`, `ua`).
- Outbound delivery from the `notify-outbid` Edge Function (ADR-0008) using the standard Web Push protocol with the project's VAPID private key.
- A permission prompt that appears **only after** a user has placed a bid or explicitly opted in — never on first page load.

## Alternatives considered

- **OneSignal.** Rejected. Sends bidder identifiers to a third party; adds vendor cost.
- **Firebase Cloud Messaging.** Rejected. Pulls in Google identity tooling and a second vendor; provides no advantage over native Web Push for our use case.

## Consequences

- Positive: no per-device fee; PII stays inside Supabase; aligns with the "Stress Less" promise (no surprise prompts).
- Negative: iOS Safari requires the PWA to be installed before push works (16.4+). iOS bidders fall back to SMS (ADR-0004) plus in-app toasts.
- Operational: VAPID keypair generated once and stored as `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, and `WEB_PUSH_CONTACT_EMAIL` environment variables.

## Compliance / acceptance criteria

- Browser push permission is requested **after** bid intent, not on landing.
- The fallback chain is push → SMS → in-app; missing push capability degrades silently to SMS where the user has opted in.
- All web push payloads are end-to-end encrypted using the user's `p256dh`/`auth` keys.
