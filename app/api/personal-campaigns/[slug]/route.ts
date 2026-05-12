import { NextResponse } from "next/server";

/**
 * Personal-campaign detail API (Sprint 1 — route shell, not yet wired).
 *
 * Will support:
 *   - GET    /api/personal-campaigns/[slug]   — fetch by slug for the owner
 *   - PATCH  /api/personal-campaigns/[slug]   — owner-only updates
 *   - DELETE /api/personal-campaigns/[slug]   — owner-only soft delete
 *
 * Public read path stays on the server component at `app/p/[slug]/page.tsx`
 * which queries `personal_campaigns` directly under the active-status RLS
 * policy.
 */

export const dynamic = "force-dynamic";

const NOT_IMPLEMENTED_BODY = {
  ok: false,
  error: "not_implemented",
  message:
    "The personal-campaign detail API is scaffolded but not yet wired. " +
    "See docs/sprint-plan.md (Sprint 1).",
} as const;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(NOT_IMPLEMENTED_BODY, { status: 501 });
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(NOT_IMPLEMENTED_BODY, { status: 501 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(NOT_IMPLEMENTED_BODY, { status: 501 });
}
