import type { Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import {
  ensureProfileAdminRole,
  linkPlatformAdminUser,
  type PlatformAdminRow,
} from "@/lib/platform-admin";

async function findAuthUserByEmail(email: string) {
  if (!supabaseAdmin) return null;
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 500 });
    if (error) throw error;
    const users = data.users ?? [];
    const found = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 500) break;
    page += 1;
  }
  return null;
}

/** Issue a Supabase session for a verified platform admin (real email, not synthetic phone email). */
export async function createSessionForPlatformAdmin(
  admin: PlatformAdminRow,
): Promise<Session> {
  if (!supabaseAdmin) throw new Error("Database unavailable");

  const email = admin.email.trim().toLowerCase();
  const e164 = admin.phone_e164;
  const displayName = admin.display_name ?? "Platform Admin";

  let user = await findAuthUserByEmail(email);
  if (user) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
      phone: e164,
      phone_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        platform_admin: true,
        platform_admin_role: admin.role,
        full_name: displayName,
      },
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      phone: e164,
      phone_confirm: true,
      user_metadata: {
        platform_admin: true,
        platform_admin_role: admin.role,
        full_name: displayName,
      },
    });
    if (error) throw error;
    user = data.user;
  }

  await ensureProfileAdminRole(user.id, email, displayName);
  await linkPlatformAdminUser(admin.id, user.id);

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
