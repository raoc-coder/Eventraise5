import { NextRequest, NextResponse } from "next/server";
import { normalizePhoneE164 } from "@/lib/phone";
import { sendVerification } from "@/lib/twilio-verify";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientKey = getClientKeyFromHeaders(req.headers);
  if (!(await rateLimit(`verify-send:${clientKey}`, 8))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const e164 = normalizePhoneE164(String(body.phone ?? ""));
  if (!e164) {
    return NextResponse.json(
      { ok: false, error: "invalid_phone", message: "Enter a valid US mobile number (10 digits)." },
      { status: 400 },
    );
  }

  const result = await sendVerification(e164);
  if (!result.ok) {
    const status = result.status === "unconfigured" ? 503 : 502;
    return NextResponse.json(
      { ok: false, error: "send_failed", message: result.error || "Could not send code" },
      { status },
    );
  }

  return NextResponse.json({ ok: true, status: result.status });
}
