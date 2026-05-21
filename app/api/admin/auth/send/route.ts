import { NextResponse } from "next/server";
import { platformAdminUsesTwilio } from "@/lib/platform-admin-login";

export const dynamic = "force-dynamic";

/** Disabled while platform admin auth uses static credentials (no Twilio). */
export async function POST(): Promise<NextResponse> {
  if (!platformAdminUsesTwilio()) {
    return NextResponse.json(
      {
        ok: false,
        error: "static_auth",
        message: "Admin login uses email, phone, and PIN at /admin/login — OTP is not enabled.",
      },
      { status: 410 },
    );
  }

  return NextResponse.json(
    { ok: false, error: "not_implemented", message: "Enable PLATFORM_ADMIN_USE_TWILIO and wire OTP handlers." },
    { status: 501 },
  );
}
