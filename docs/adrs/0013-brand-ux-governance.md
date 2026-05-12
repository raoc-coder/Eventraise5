# ADR-0013: Trust 70 / Action 30 brand governance

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Design, Engineering
- **Related:** DESIGN_SYSTEM.md, DESIGN_SYSTEM_GUIDE.md

## Context

EventraiseHub's brand guidelines mandate a strict 70/30 color ratio: **Trust Blue** for structural foundations, headers, and security/payment surfaces; **Action Orange** for high-impact CTAs and progress affirmations. The platform tokens (`trust-*` and `action-*` in `tailwind.config.js` and `app/globals.css`) were already aligned in earlier work. New features must continue to honor this system without introducing ad-hoc accent colors.

## Decision

All new UI for Epic 1 and Epic 2 uses **only** the `trust-*` and `action-*` token families plus neutral grays. Specifically:

- Structural chrome, navigation, headers, security badges, payment-area framing: `trust-*` (target ~70% of pixel weight).
- Primary CTAs, fundraising thermometer fill, leaderboard rank-1 highlight, "you're winning" / "you won" affirmations, real-time progress: `action-*` (target ~30%).
- Success states (registration confirmed, donation received) keep semantic green sparingly; do not bleed into structural areas.
- Typography, spacing, and component shape follow existing primitives in `components/ui/*`.

Design reviews use a checklist that verifies the 70/30 split, contrast, and reuse of existing primitives.

## Alternatives considered

- **Allow new accent colors per feature.** Rejected. Drifts the brand and undermines the "Professionalization of Passion" tone.

## Consequences

- Positive: faster builds (no decisions to relitigate); consistent brand; better contrast.
- Negative: occasional designer pushback when a one-off accent feels expressive; resolved by reusing tokens.
- Operational: a "brand review" pass becomes part of PR checklists for any UI change.

## Compliance / acceptance criteria

- No new Tailwind color tokens are introduced for Epics 1–2.
- All new progress fills use `bg-action-500`.
- All payment-adjacent and security-badge surfaces use `trust-*`.
