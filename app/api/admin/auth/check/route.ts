import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { platformAdminUsesTwilio, verifyPlatformAdminPassword } from "@/lib/platform-admin-login";
import { findPlatformAdminByCredentials, normalizeAdminEmail } from "@/lib/platform-admin";
import { normalizePhoneE164 } from "@/lib/phone";
import { checkVerification } from "@/lib/twilio-verify";
import { createSessionForPlatformAdmin } from "@/lib/auth-admin-session";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Platform admin OTP check + password second factor (ADR-0018).
 * Body: { email, phone, code, password }
 * Session cookies only — no refresh_token in JSON.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!platformAdminUsesTwilio()) {
    return NextResponse.json(
      {
        ok: false,
        error: "static_auth",
        message: "Use POST /api/admin/auth/login with email, phone, and password.",
      },
      { status: 410 },
    );
  }

  const clientKey = getClientKeyFromHeaders(req.headers);
  if (!(await rateLimit(`admin-auth-check:${clientKey}`, 12))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

  let body: { email?: string; phone?: string; code?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = normalizeAdminEmail(String(body.email ?? ""));
  const e164 = normalizePhoneE164(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !e164 || !/^\d{4,8}$/.test(code) || !password.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_request",
        message: "Email, phone, verification code, and password are required.",
      },
      { status: 400 },
    );
  }

  const roster = await findPlatformAdminByCredentials(email, e164);
  if (!roster.admin || !verifyPlatformAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "not_authorized", message: "Invalid credentials." },
      { status: 403 },
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
    const session = await createSessionForPlatformAdmin(roster.admin);
    if (!session.access_token || !session.refresh_token) {
      throw new Error("Session tokens missing");
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { error: cookieError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (cookieError) throw cookieError;

    return NextResponse.json({
      ok: true,
      role: roster.admin.role,
      user: { id: session.user?.id, email: session.user?.email },
    });
  } catch (err) {
    console.error("[admin/auth/check]", err);
    return NextResponse.json(
      { ok: false, error: "session_failed", message: "Verification succeeded but sign-in failed." },
      { status: 500 },
    );
  }
}
