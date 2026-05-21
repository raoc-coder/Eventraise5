import { NextRequest, NextResponse } from "next/server";
import { platformAdminUsesTwilio } from "@/lib/platform-admin-login";

export const dynamic = "force-dynamic";

/** Legacy OTP check — use POST /api/admin/auth/login while static auth is active. */
export async function POST(_req: NextRequest): Promise<NextResponse> {
  if (!platformAdminUsesTwilio()) {
    return NextResponse.json(
      {
        ok: false,
        error: "static_auth",
        message: "Use POST /api/admin/auth/login with email and phone.",
      },
      { status: 410 },
    );
  }

  return NextResponse.json(
    { ok: false, error: "not_implemented", message: "Twilio OTP check not wired in this build." },
    { status: 501 },
  );
}
