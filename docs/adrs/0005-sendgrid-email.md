# ADR-0005: SendGrid for transactional email (reuse existing)

- **Status:** Superseded by ADR-0017
- **Date:** 2026-05-12
- **Owners:** Engineering, Marketing
- **Related:** ADR-0008
- **Superseded by:** [ADR-0017](./0017-twilio-verify-phone-auth.md) (2026-05-20 — SendGrid removed; notifications are push + SMS + in-app only)

## Context

The repository already includes `@sendgrid/mail` and uses SendGrid for transactional mail. The Epic 1 and Epic 2 features add three new email surfaces: outbid summary (digest after a flurry), fundraiser daily recap (P2P), and matching-gift confirmations. There is no compelling reason to introduce a new email vendor for these flows.

## Decision

Keep **SendGrid** as the transactional email provider. Add new SendGrid templates for:

- Outbid summary (sent only if the user is still outbid after a debounce window).
- Personal-campaign daily recap (Sprint 2).
- Matching-gift confirmation to the donor and a daily roll-up to the sponsor (Sprint 2).

Ensure **domain authentication** for `eventraisehub.com` (SPF, DKIM, DMARC) is complete before Sprint 5 sends scale.

## Alternatives considered

- **Postmark / Resend / AWS SES.** Rejected. Functional parity is fine; switching costs and brand IP-warming are not justified.

## Consequences

- Positive: no new vendor; uses existing template library and analytics.
- Negative: deliverability hinges on DNS hygiene; missing DMARC produces silent failures.
- Operational: DKIM/SPF/DMARC verification has roughly a one-week DNS lead time on the registrar side.

## Compliance / acceptance criteria

- `eventraisehub.com` shows DKIM `pass`, SPF `pass`, DMARC policy `quarantine` or stricter, before the first Sprint 5 release.
- All outbound mail carries a list-unsubscribe header and respects `public.notification_preferences.outbid_email`.
