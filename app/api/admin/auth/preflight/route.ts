import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Non-secret ops check for admin login (safe to call from browser).
 * Intentionally minimal — avoids leaking project refs, admin counts, or
 * individual secret-presence flags to unauthenticated callers.
 */
export async function GET(): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const adminPasswordConfigured = Boolean(process.env.PLATFORM_ADMIN_PASSWORD?.trim());
  const supabaseUrlConfigured = Boolean(url);

  let rosterReady = false;
  if (supabaseAdmin) {
    const { count, error } = await supabaseAdmin
      .from("platform_admins")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    rosterReady = !error && (count ?? 0) > 0;
  }

  const ready =
    serviceRoleConfigured &&
    adminPasswordConfigured &&
    supabaseUrlConfigured &&
    rosterReady;

  return NextResponse.json({
    ok: true,
    ready,
  });
}
