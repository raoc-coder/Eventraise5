# ADR-0004: Twilio for SMS outbid alerts and notifications

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering, Operations
- **Related:** ADR-0003, ADR-0008, ADR-0014

## Context

At galas, many attendees are not actively watching the bidding screen. SMS reaches users reliably without requiring a tab open or push permission. United States bulk SMS now requires **10DLC** (Application-to-Person) registration for high-deliverability sending, which has a regulatory lead time of two to four weeks. Twilio is the most mature programmable messaging vendor and is broadly trusted by enterprise customers.

## Decision

Use **Twilio Programmable Messaging** for outbound SMS.

- Provision a **10DLC** number; register **brand** and **campaign**.
- Use a **Messaging Service** to enable sender pool, sticky sender, and built-in STOP/HELP keyword handling.
- Outbound calls happen from the `notify-outbid` Edge Function (ADR-0008).
- Inbound webhooks for delivery status and STOP/HELP land at `app/api/webhooks/twilio/*` and update `public.notification_preferences`.

## Alternatives considered

- **MessageBird, Telnyx.** Rejected. Comparable feature set, smaller ecosystem and fewer integrations.
- **AWS SNS.** Rejected. Lower-level, fewer built-in compliance controls, no native HELP/STOP handling.

## Consequences

- Positive: industry-standard, well-documented, observable.
- Negative: **10DLC registration is two to four weeks**, which is on the critical path for Sprint 5. Registration must begin during Sprint 0 so it does not block GA.
- Operational: requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, and a webhook signing secret.

## Compliance / acceptance criteria

- All SMS sends are opt-in only and respect `public.notification_preferences.outbid_sms`.
- HELP returns branded help copy; STOP unsubscribes and writes back to preferences.
- DLR (delivery receipts) are stored on `public.notification_deliveries` rows for SLO reporting (ADR-0014).
