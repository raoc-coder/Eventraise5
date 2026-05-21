import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import {
  findPlatformAdminByCredentials,
  getPlatformAdminByUserId,
  normalizeAdminEmail,
  resolvePlatformAdminAccess,
} from "@/lib/platform-admin";
import { normalizePhoneE164, maskPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

async function requireSuperAdmin(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.user) throw new Error("Authentication required");
  const access = await resolvePlatformAdminAccess(auth.user);
  if (!access.isSuperAdmin) throw new Error("Super admin required");
  return { auth, access };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await requireSuperAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Forbidden";
    const status = msg === "Authentication required" ? 401 : 403;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("platform_admins")
    .select("id, email, phone_e164, role, display_name, user_id, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  const admins = (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    phoneMasked: maskPhone(row.phone_e164),
    role: row.role,
    displayName: row.display_name,
    userId: row.user_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ ok: true, admins });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let creatorUserId: string;
  try {
    const { auth } = await requireSuperAdmin(req);
    creatorUserId = auth.user.id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Forbidden";
    const status = msg === "Authentication required" ? 401 : 403;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }

  let body: { email?: string; phone?: string; displayName?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = normalizeAdminEmail(String(body.email ?? ""));
  const e164 = normalizePhoneE164(String(body.phone ?? ""));
  const displayName = String(body.displayName ?? "").trim() || null;
  const role = body.role === "super_admin" ? "super_admin" : "admin";

  if (!email || !e164) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Valid email and phone are required." },
      { status: 400 },
    );
  }

  const duplicate = await findPlatformAdminByCredentials(email, e164);
  if (duplicate) {
    return NextResponse.json(
      { ok: false, error: "already_exists", message: "An admin with that email and phone already exists." },
      { status: 409 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("platform_admins")
    .insert({
      email,
      phone_e164: e164,
      role,
      display_name: displayName,
      created_by: creatorUserId,
      is_active: true,
    })
    .select("id, email, role, display_name")
    .single();

  if (error) {
    console.error("[platform-admins POST]", error);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, admin: data });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    await requireSuperAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Forbidden";
    const status = msg === "Authentication required" ? 401 : 403;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }

  let body: { id?: string; isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from("platform_admins")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (target.role === "super_admin" && body.isActive === false) {
    const { count } = await supabaseAdmin
      .from("platform_admins")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { ok: false, error: "last_super_admin", message: "Cannot deactivate the only super admin." },
        { status: 400 },
      );
    }
  }

  const updates: { is_active?: boolean } = {};
  if (typeof body.isActive === "boolean") updates.is_active = body.isActive;

  const { error } = await supabaseAdmin.from("platform_admins").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
