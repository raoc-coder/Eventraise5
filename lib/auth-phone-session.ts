import type { Session, User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { phoneToSyntheticEmail } from "@/lib/phone";

export interface PhoneProfileMetadata {
  full_name?: string;
  organization_name?: string;
}

async function findUserByPhone(e164: string): Promise<User | null> {
  if (!supabaseAdmin) return null;
  const synthetic = phoneToSyntheticEmail(e164);
  let page = 1;
  const perPage = 500;
  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    const found =
      users.find((u) => u.phone === e164) ??
      users.find((u) => (u.email || "").toLowerCase() === synthetic.toLowerCase());
    if (found) return found;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
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
  if (error) throw error;
  return data.user;
}

/** Issue a Supabase session for a verified phone user (service role). */
export async function createSessionForPhoneUser(
  e164: string,
  profile?: PhoneProfileMetadata,
): Promise<Session> {
  if (!supabaseAdmin) throw new Error("Database unavailable");

  const user = await upsertPhoneUser(e164, profile);
  const email = user.email || phoneToSyntheticEmail(e164);

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError) throw linkError;

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error("Failed to generate auth link");

  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error("Failed to create session");

  return sessionData.session;
}
