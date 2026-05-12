# ADR-0001: Use Supabase SQL migrations (no ORM swap)

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Tech lead
- **Related:** ADR-0011, ADR-0012

## Context

The PRD for Epic 1 and Epic 2 mentioned "Prisma/Drizzle" generically. The current EventraiseHub repository has nineteen hand-written Supabase SQL migrations under `supabase/migrations/*.sql`, including conventions for row-level security, `handle_updated_at()` triggers, and denormalized rollup triggers (for example, `current_amount` and `current_volunteers`). Introducing a new ORM mid-roadmap would force a baseline-migration step, retrofitting of RLS policies into ORM tooling, and a parallel period of two systems of record.

## Decision

All new tables and schema changes for Epics 1 and 2 are delivered as **Supabase SQL migrations** following the existing naming and convention pattern (`NNN_short_name.sql` under `supabase/migrations/`). No ORM (Prisma or Drizzle) is introduced in this roadmap.

## Alternatives considered

- **Prisma migrate.** Rejected. Requires a baseline migration, a parallel schema source-of-truth, and recreates RLS handling outside the database. High risk for zero feature payoff.
- **Drizzle Kit with introspect + migrations.** Rejected for the same reasons, with the additional concern that drizzle's RLS support is still maturing.
- **Drizzle as a types-only read layer (no migrations).** Deferred. May be reconsidered after Epic 2 as a developer-experience improvement; introducing it is additive and reversible.

## Consequences

- Positive: zero migration risk; reuses the existing RLS, trigger, and rollup conventions; smaller delta for code review.
- Negative: writers in TypeScript do not get compile-time table types out of the box. Mitigation is to keep the existing `supabase gen types typescript` flow (see `SUPABASE_MIGRATION.md`).
- Operational: no new tools or accounts.

## Compliance / acceptance criteria

- All Sprint 1–5 schema deltas land as files matching `supabase/migrations/0[2-9][0-9]_*.sql`.
- No `prisma/` or `drizzle/` directory is added during Epics 1 and 2.
