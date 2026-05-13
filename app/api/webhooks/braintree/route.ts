import { NextResponse } from "next/server";

/** Braintree webhooks are no longer processed (ADR-0016). */
const BODY = {
  error: "braintree_sunset",
  message:
    "Braintree webhooks are not accepted. Use PayPal webhooks — docs/adrs/0016-braintree-sunset.md.",
} as const;

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(BODY, { status: 410 });
}