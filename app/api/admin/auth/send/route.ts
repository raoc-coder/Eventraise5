import { NextRequest, NextResponse } from "next/server";
import { platformAdminUsesTwilio } from "@/lib/platform-admin-login";
import { findPlatformAdminByCredentials, normalizeAdminEmail } from "@/lib/platform-admin";
import { normalizePhoneE164 } from "@/lib/phone";
import { sendVerification } from "@/lib/twilio-verify";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Platform admin OTP send (Twilio Verify).
 * Requires PLATFORM_ADMIN_USE_TWILIO=true. Body: { email, phone }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!platformAdminUsesTwilio()) {
    return NextResponse.json(
      {
        ok: false,
        error: "static_auth",
        message: "Admin login uses email, phone, and password at /admin/login — OTP is not enabled.",
      },
      { status: 410 },
    );
  }

  const clientKey = getClientKeyFromHeaders(req.headers);
  if (!(await rateLimit(`admin-auth-send:${clientKey}`, 8))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

  let body: { email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = normalizeAdminEmail(String(body.email ?? ""));
  const e164 = normalizePhoneE164(String(body.phone ?? ""));
  if (!email || !e164) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Email and phone are required." },
      { status: 400 },
    );
  }

  const roster = await findPlatformAdminByCredentials(email, e164);
  if (roster.error === "no_service_role") {
    return NextResponse.json(
      { ok: false, error: "misconfigured", message: "Server database not configured." },
      { status: 503 },
    );
  }
  // Same response whether or not on roster (avoid account enumeration).
  if (roster.admin) {
    const sent = await sendVerification(e164);
    if (!sent.ok) {
      const status = sent.status === "unconfigured" ? 503 : 502;
      return NextResponse.json(
        { ok: false, error: "send_failed", message: sent.error || "Could not send code" },
        { status },
      );
    }
  }

  return NextResponse.json({ ok: true, message: "If that admin exists, a code was sent." });
}
