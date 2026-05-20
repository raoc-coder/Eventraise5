# ADR-0010: Authentication model for bidders and donors

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Product, Engineering
- **Related:** ADR-0006, ADR-0012

## Context

Two user types interact with the new features. **Bidders** carry financial commitment (winning bids become invoices) and must be unambiguously identifiable. **Donors** convert better when account creation is not forced; the existing donation flow already supports guest donations with email capture.

## Decision

- **Bidding requires an authenticated Supabase Auth user.** **Phone OTP via Twilio Verify** is the default sign-in (ADR-0017). Each `auction_registrations` row binds the user to a paddle number and a vaulted payment token.
- **Donations remain guest-allowed.** A guest donation captures email and optionally creates a "claim" link in the receipt that lets the user create an account and attribute the donation to their profile.
- **Personal-campaign creation** (P2P) requires authentication so the owner can manage edits and payouts.

## Alternatives considered

- **Require accounts for all donors.** Rejected. Hurts conversion and contradicts the "Stress Less" promise.
- **Allow guest bidding via captured email only.** Rejected. Too easy to grief, no accountability for winning bids.

## Consequences

- Positive: clean separation of high-trust (bidders) and low-friction (donors) flows.
- Negative: P2P fundraisers must register, which is a small added step; balanced by giving them their own page and analytics.
- Operational: Supabase Auth stores users; OTP proof is Twilio Verify (see ADR-0017).

## Compliance / acceptance criteria

- The bid endpoint rejects requests without a valid session.
- The donation endpoint accepts guest writes but stores email and supports the post-donate claim flow.
