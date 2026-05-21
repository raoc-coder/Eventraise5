import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Non-secret ops check for admin login (safe to call from browser).
 * Use after setting Vercel env vars + redeploy.
 */
export async function GET(): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;

  let activeAdminCount: number | null = null;
  let rosterError: string | null = null;

  if (supabaseAdmin) {
    const { count, error } = await supabaseAdmin
      .from("platform_admins")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) {
      rosterError = error.message;
    } else {
      activeAdminCount = count ?? 0;
    }
  }

  return NextResponse.json({
    ok: true,
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    adminPasswordConfigured: Boolean(process.env.PLATFORM_ADMIN_PASSWORD?.trim()),
    supabaseUrlConfigured: Boolean(url),
    supabaseProjectRef: projectRef,
    twilioAdminMode: process.env.PLATFORM_ADMIN_USE_TWILIO === "true",
    activePlatformAdmins: activeAdminCount,
    rosterError,
    expectedProjectRef: "yxzypekwyuopbanroobr",
    projectRefMatches: projectRef === "yxzypekwyuopbanroobr",
  });
}
