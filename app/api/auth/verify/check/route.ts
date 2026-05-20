import { NextRequest, NextResponse } from "next/server";
import { normalizePhoneE164 } from "@/lib/phone";
import { checkVerification } from "@/lib/twilio-verify";
import { createSessionForPhoneUser } from "@/lib/auth-phone-session";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientKey = getClientKeyFromHeaders(req.headers);
  if (!rateLimit(`verify-check:${clientKey}`, 12)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: {
    phone?: string;
    code?: string;
    fullName?: string;
    organizationName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const e164 = normalizePhoneE164(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  if (!e164 || !/^\d{4,8}$/.test(code)) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Phone and verification code are required." },
      { status: 400 },
    );
  }

  const verified = await checkVerification(e164, code);
  if (!verified.ok) {
    const status = verified.status === "unconfigured" ? 503 : 401;
    return NextResponse.json(
      { ok: false, error: "invalid_code", message: verified.error || "Invalid or expired code" },
      { status },
    );
  }

  try {
    const session = await createSessionForPhoneUser(e164, {
      full_name: body.fullName,
      organization_name: body.organizationName,
    });
    return NextResponse.json({
      ok: true,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user,
      },
    });
  } catch (err) {
    console.error("[auth/verify/check]", err);
    return NextResponse.json(
      { ok: false, error: "session_failed", message: "Sign-in succeeded but session could not be created." },
      { status: 500 },
    );
  }
}
