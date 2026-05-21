/**
 * Platform admin sign-in without Twilio (temporary).
 * Email + phone must match `platform_admins` + shared password from env.
 * Set PLATFORM_ADMIN_USE_TWILIO=true later to switch to OTP flow.
 */

import { timingSafeEqual } from "crypto";
import { findPlatformAdminByCredentials, normalizeAdminEmail, type PlatformAdminRow } from "@/lib/platform-admin";
import { normalizePhoneE164 } from "@/lib/phone";

export function platformAdminUsesTwilio(): boolean {
  return process.env.PLATFORM_ADMIN_USE_TWILIO === "true";
}

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Shared password for all platform admins (set PLATFORM_ADMIN_PASSWORD in env). */
export function verifyPlatformAdminPassword(password: string): boolean {
  const expected = process.env.PLATFORM_ADMIN_PASSWORD?.trim();
  if (!expected || !password) return false;
  return safeEqualString(password.trim(), expected);
}

export async function authenticatePlatformAdminStatic(
  emailRaw: string,
  phoneRaw: string,
  password: string,
): Promise<{ ok: true; admin: PlatformAdminRow } | { ok: false; error: string; message: string }> {
  const email = normalizeAdminEmail(emailRaw);
  const e164 = normalizePhoneE164(phoneRaw);
  if (!email || !e164 || !password.trim()) {
    return {
      ok: false,
      error: "invalid_request",
      message: "Email, phone, and password are required.",
    };
  }

  if (!process.env.PLATFORM_ADMIN_PASSWORD?.trim()) {
    return {
      ok: false,
      error: "misconfigured",
      message: "Admin password is not configured on the server (PLATFORM_ADMIN_PASSWORD).",
    };
  }

  const roster = await findPlatformAdminByCredentials(email, e164);
  if (roster.error) {
    console.error("[platform-admin-login] roster lookup:", roster.error);
    return {
      ok: false,
      error: "misconfigured",
      message:
        roster.error === "no_service_role"
          ? "Server database not configured (SUPABASE_SERVICE_ROLE_KEY)."
          : "Admin roster unavailable. Check Supabase project and migration 032.",
    };
  }

  if (!roster.admin || !verifyPlatformAdminPassword(password)) {
    return {
      ok: false,
      error: "not_authorized",
      message: "Invalid email, phone, or password.",
    };
  }

  const admin = roster.admin;

  return { ok: true, admin };
}
