import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { authenticatePlatformAdminStatic, platformAdminUsesTwilio } from "@/lib/platform-admin-login";
import { createSessionForPlatformAdmin } from "@/lib/auth-admin-session";

export const dynamic = "force-dynamic";

/**
 * Platform admin sign-in (static credentials — no Twilio).
 * Body: { email, phone, password }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (platformAdminUsesTwilio()) {
    return NextResponse.json(
      {
        ok: false,
        error: "use_legacy_otp",
        message: "Twilio mode enabled — use /api/admin/auth/send and /api/admin/auth/check.",
      },
      { status: 400 },
    );
  }

  const clientKey = getClientKeyFromHeaders(req.headers);
  if (!rateLimit(`admin-auth-login:${clientKey}`, 12)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

  let body: { email?: string; phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const auth = await authenticatePlatformAdminStatic(
    String(body.email ?? ""),
    String(body.phone ?? ""),
    String(body.password ?? ""),
  );

  if (!auth.ok) {
    const status = auth.error === "not_authorized" ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: auth.error, message: auth.message },
      { status },
    );
  }

  try {
    const session = await createSessionForPlatformAdmin(auth.admin);
    return NextResponse.json({
      ok: true,
      role: auth.admin.role,
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
    console.error("[admin/auth/login]", err);
    return NextResponse.json(
      { ok: false, error: "session_failed", message: "Credentials accepted but sign-in failed." },
      { status: 500 },
    );
  }
}
