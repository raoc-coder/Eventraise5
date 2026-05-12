import { NextResponse } from "next/server";

/**
 * Personal-campaign API surface (Sprint 1 — route shells, not yet wired).
 *
 * The list/create handlers will land later in Sprint 1/Sprint 2 (US 1.1 and
 * US 1.2). Stubbing the routes now lets us:
 *   - reserve the URL contract early (`/api/personal-campaigns`);
 *   - keep the TypeScript surface compiling for future client code;
 *   - clearly signal "not implemented" instead of returning 404.
 *
 * ADR-0009: write handlers MUST accept and require a client-supplied
 *           `idempotency_key`. The stub does not yet enforce this; tests for
 *           that contract land alongside the real implementation.
 */

export const dynamic = "force-dynamic";

const NOT_IMPLEMENTED_BODY = {
  ok: false,
  error: "not_implemented",
  message:
    "The personal-campaigns API is scaffolded but not yet wired. " +
    "See docs/sprint-plan.md (Sprint 1).",
} as const;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(NOT_IMPLEMENTED_BODY, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(NOT_IMPLEMENTED_BODY, { status: 501 });
}
