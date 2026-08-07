import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePhoneE164 } from "@/lib/phone";
import { isOwnerAdminUser } from "@/lib/auth-utils";

export type PlatformAdminRole = "super_admin" | "admin";

export type PlatformAdminRow = {
  id: string;
  email: string;
  phone_e164: string;
  role: PlatformAdminRole;
  display_name: string | null;
  user_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export function normalizeAdminEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export type PlatformAdminLookupResult =
  | { admin: PlatformAdminRow; error?: undefined }
  | { admin: null; error?: "no_service_role" | "invalid_input" | string };

/** Active platform admin roster row for a verified E.164 phone (organizer OTP bridge). */
export async function findActivePlatformAdminByPhone(
  phoneRaw: string,
): Promise<PlatformAdminRow | null> {
  if (!supabaseAdmin) return null;
  const e164 = normalizePhoneE164(phoneRaw);
  if (!e164) return null;

  const { data, error } = await supabaseAdmin
    .from("platform_admins")
    .select("id, email, phone_e164, role, display_name, user_id, is_active, created_by, created_at")
    .eq("phone_e164", e164)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[platform_admins] phone lookup failed:", error.message);
    return null;
  }
  return (data as PlatformAdminRow | null) ?? null;
}

export async function findPlatformAdminByCredentials(
  email: string,
  phoneRaw: string,
): Promise<PlatformAdminLookupResult> {
  if (!supabaseAdmin) return { admin: null, error: "no_service_role" };
  const e164 = normalizePhoneE164(phoneRaw);
  const normalizedEmail = normalizeAdminEmail(email);
  if (!e164 || !normalizedEmail) return { admin: null, error: "invalid_input" };

  const { data, error } = await supabaseAdmin
    .from("platform_admins")
    .select("id, email, phone_e164, role, display_name, user_id, is_active, created_by, created_at")
    .eq("email", normalizedEmail)
    .eq("phone_e164", e164)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[platform_admins] lookup failed:", error.message);
    return { admin: null, error: error.message };
  }
  if (!data) return { admin: null };
  return { admin: data as PlatformAdminRow };
}

export async function getPlatformAdminByUserId(
  userId: string,
): Promise<PlatformAdminRow | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("platform_admins")
    .select("id, email, phone_e164, role, display_name, user_id, is_active, created_by, created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  return (data as PlatformAdminRow | null) ?? null;
}

export type PlatformAdminAccess = {
  isPlatformAdmin: boolean;
  isSuperAdmin: boolean;
  role: PlatformAdminRole | null;
  row: PlatformAdminRow | null;
};

/**
 * Env allowlist (legacy owner) + active platform_admins roster only.
 * Do NOT trust profiles.role — that column is self-updatable via RLS unless
 * migration 033 is applied, and must never grant platform console access.
 */
export async function resolvePlatformAdminAccess(user: User | null): Promise<PlatformAdminAccess> {
  if (!user) {
    return { isPlatformAdmin: false, isSuperAdmin: false, role: null, row: null };
  }

  if (isOwnerAdminUser(user)) {
    return { isPlatformAdmin: true, isSuperAdmin: true, role: "super_admin", row: null };
  }

  const row = await getPlatformAdminByUserId(user.id);
  if (row) {
    return {
      isPlatformAdmin: true,
      isSuperAdmin: row.role === "super_admin",
      role: row.role,
      row,
    };
  }

  return { isPlatformAdmin: false, isSuperAdmin: false, role: null, row: null };
}

export async function linkPlatformAdminUser(
  adminId: string,
  userId: string,
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database unavailable");
  await supabaseAdmin.from("platform_admins").update({ user_id: userId }).eq("id", adminId);
}

export async function ensureProfileAdminRole(userId: string, email: string, fullName?: string): Promise<void> {
  if (!supabaseAdmin) return;
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("profiles")
      .update({ role: "admin", email, full_name: fullName ?? undefined })
      .eq("id", userId);
    return;
  }

  await supabaseAdmin.from("profiles").insert({
    id: userId,
    email,
    full_name: fullName ?? "Platform Admin",
    role: "admin",
  });
}
