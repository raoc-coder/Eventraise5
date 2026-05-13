import { NextResponse } from "next/server";

/**
 * Braintree sunset (ADR-0016, Sprint 0.7).
 * Any legacy `/api/braintree/*` URL returns 410 with a stable JSON body.
 */

const BODY = {
  error: "braintree_sunset",
  message:
    "Braintree has been removed from EventraiseHub. Use PayPal checkout — see docs/adrs/0016-braintree-sunset.md.",
} as const;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}
