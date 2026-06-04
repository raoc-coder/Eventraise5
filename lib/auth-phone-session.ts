import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { phoneToSyntheticEmail } from "@/lib/phone";

export interface PhoneProfileMetadata {
  full_name?: string;
  organization_name?: string;
}

function isPlatformAdminUser(user: User): boolean {
  return user.user_metadata?.platform_admin === true;
}

/**
 * Find an existing non-admin auth user for the given phone number.
 * Returns null if the only match is a platform admin user (different identity).
 */
async function findUserByPhone(e164: string): Promise<User | null> {
  if (!supabaseAdmin) return null;
  const admin = supabaseAdmin;
  const synthetic = phoneToSyntheticEmail(e164);

  const fetchUserById = async (id: string): Promise<User | null> => {
    const { data: userResp, error: userErr } = await admin.auth.admin.getUserById(id);
    if (userErr) throw userErr;
    return userResp.user ?? null;
  };

  // Fast path: look up by deterministic synthetic email — only regular phone users have this.
  const { data: byEmail, error: emailError } = await admin
    .schema("auth")
    .from("users")
    .select("id")
    .eq("email", synthetic)
    .limit(1)
    .maybeSingle();
  if (!emailError && byEmail?.id) {
    const u = await fetchUserById(byEmail.id);
    if (u && !isPlatformAdminUser(u)) return u;
  }

  // Phone-field match: could be a legacy phone user OR an admin who registered the same number.
  // Only return it if it's NOT a platform admin.
  const { data: byPhone, error: phoneError } = await admin
    .schema("auth")
    .from("users")
    .select("id")
    .eq("phone", e164)
    .limit(1)
    .maybeSingle();
  if (!phoneError && byPhone?.id) {
    const u = await fetchUserById(byPhone.id);
    if (u && !isPlatformAdminUser(u)) return u;
    // If it IS an admin user, skip — we'll create a separate phone-user row below.
  }

  const schemaBlocked = Boolean(emailError || phoneError);
  if (!schemaBlocked) return null;

  // Fallback if schema access is blocked: scan and match, skipping admin users.
  let page = 1;
  const perPage = 500;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    const found =
      users.find(
        (u) => !isPlatformAdminUser(u) && (u.email || "").toLowerCase() === synthetic.toLowerCase(),
      ) ??
      users.find((u) => !isPlatformAdminUser(u) && u.phone === e164) ??
      users.find((u) => {
        const metaPhone = u.user_metadata?.phone;
        return !isPlatformAdminUser(u) && typeof metaPhone === "string" && metaPhone === e164;
      });
    if (found) return found;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function exchangeMagicLinkForSession(email: string): Promise<Session> {
  if (!supabaseAdmin) throw new Error("Database unavailable");

  console.log("[auth-phone-session] generating magic link for:", email);
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError) {
    console.error("[auth-phone-session] generateLink error:", linkError);
    throw linkError;
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error("Failed to generate auth link: no hashed_token in response");

  const otpType = (linkData.properties?.verification_type || "magiclink") as EmailOtpType;
  console.log("[auth-phone-session] verifyOtp type:", otpType);
  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
    token_hash: tokenHash,
    type: otpType,
  });
  if (sessionError) {
    console.error("[auth-phone-session] verifyOtp error:", sessionError);
    throw sessionError;
  }
  if (!sessionData.session) throw new Error("verifyOtp succeeded but returned no session");

  return sessionData.session;
}

async function upsertPhoneUser(
  e164: string,
  profile?: PhoneProfileMetadata,
): Promise<User> {
  if (!supabaseAdmin) throw new Error("Database unavailable");

  const syntheticEmail = phoneToSyntheticEmail(e164);
  const metadata: Record<string, string> = { phone: e164 };
  if (profile?.full_name?.trim()) metadata.full_name = profile.full_name.trim();
  if (profile?.organization_name?.trim()) {
    metadata.organization_name = profile.organization_name.trim();
  }

  const existing = await findUserByPhone(e164);
  if (existing) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      phone: e164,
      phone_confirm: true,
      user_metadata: { ...existing.user_metadata, ...metadata },
    });
    if (error) throw error;
    return data.user;
  }

  // Try to create with phone field. If Supabase rejects because the phone is already
  // claimed by another user (e.g. a platform admin), fall back to email-only creation.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    phone: e164,
    phone_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    const isConflict =
      msg.includes("already") || msg.includes("registered") || msg.includes("exists");

    if (isConflict) {
      // Check if a non-admin user already exists (race condition).
      const retry = await findUserByPhone(e164);
      if (retry) {
        const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          retry.id,
          {
            phone: e164,
            phone_confirm: true,
            user_metadata: { ...retry.user_metadata, ...metadata },
          },
        );
        if (updateError) throw updateError;
        return updated.user;
      }

      // The conflict is with an admin user owning this phone. Create the phone user
      // without the phone field — synthetic email is the primary identity.
      console.warn(
        "[upsertPhoneUser] phone conflict with another user (likely admin); creating without phone field:",
        e164,
      );
      const { data: emailOnly, error: emailOnlyError } =
        await supabaseAdmin.auth.admin.createUser({
          email: syntheticEmail,
          email_confirm: true,
          user_metadata: metadata,
        });
      if (emailOnlyError) {
        const emailMsg = emailOnlyError.message?.toLowerCase() ?? "";
        if (emailMsg.includes("already") || emailMsg.includes("registered") || emailMsg.includes("exists")) {
          const existingSynthetic = await findUserByPhone(e164);
          if (existingSynthetic) return existingSynthetic;
        }
        throw emailOnlyError;
      }
      return emailOnly.user;
    }

    throw error;
  }
  return data.user;
}

/** Issue a Supabase session for a verified phone user (service role). */
export async function createSessionForPhoneUser(
  e164: string,
  profile?: PhoneProfileMetadata,
): Promise<Session> {
  if (!supabaseAdmin) throw new Error("Database unavailable");

  console.log("[auth-phone-session] upsertPhoneUser for:", e164);
  const user = await upsertPhoneUser(e164, profile);
  console.log("[auth-phone-session] upserted user id:", user.id, "email:", user.email);
  const email = user.email || phoneToSyntheticEmail(e164);
  return exchangeMagicLinkForSession(email);
}
