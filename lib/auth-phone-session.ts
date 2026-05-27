import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { phoneToSyntheticEmail } from "@/lib/phone";

export interface PhoneProfileMetadata {
  full_name?: string;
  organization_name?: string;
}

async function findUserByPhone(e164: string): Promise<User | null> {
  if (!supabaseAdmin) return null;
  const synthetic = phoneToSyntheticEmail(e164);

  // Use the service-role client to query auth.users directly — fast O(1) lookup
  // by the deterministic synthetic email rather than scanning all users.
  const { data: row, error: dbError } = await supabaseAdmin
    .schema("auth")
    .from("users")
    .select("id")
    .eq("email", synthetic)
    .limit(1)
    .maybeSingle();

  if (dbError) {
    // If direct schema access is blocked, fall back to paginated search (slow but safe)
    console.warn("[findUserByPhone] schema query failed, falling back to list scan:", dbError.message);
    let page = 1;
    const perPage = 500;
    while (page <= 20) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data.users ?? [];
      const found =
        users.find((u) => (u.email || "").toLowerCase() === synthetic.toLowerCase()) ??
        users.find((u) => u.phone === e164);
      if (found) return found;
      if (users.length < perPage) break;
      page += 1;
    }
    return null;
  }

  if (!row) return null;

  const { data: userResp, error: userErr } = await supabaseAdmin.auth.admin.getUserById(row.id);
  if (userErr) throw userErr;
  return userResp.user ?? null;
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

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    phone: e164,
    phone_confirm: true,
    user_metadata: metadata,
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
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
