import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { normalizeCampaignSlug } from "@/lib/p2p/slug";

export const dynamic = "force-dynamic";

const SELECT_FIELDS =
  "id, event_id, owner_id, team_id, slug, display_name, story, goal_amount_cents, total_raised_cents, cover_image_url, status, created_at, updated_at";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }): Promise<NextResponse> {
  try {
    const { user, db } = await requireAuth(req);
    const slug = decodeURIComponent(params.slug || "").trim();
    const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
    if (!slug || !eventId || !isUuid(eventId)) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "slug and query eventId (UUID) are required." },
        { status: 400 },
      );
    }

    const { data, error } = await db
      .from("personal_campaigns")
      .select(SELECT_FIELDS)
      .eq("slug", slug)
      .eq("event_id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[personal-campaigns slug GET]", error);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, campaign: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[personal-campaigns slug GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const slug = decodeURIComponent(params.slug || "").trim();
    const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
    if (!slug || !eventId || !isUuid(eventId)) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "slug and query eventId (UUID) are required." },
        { status: 400 },
      );
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `pc_patch:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!rateLimit(rlKey, 40)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const { data: existing, error: exErr } = await db
      .from("personal_campaigns")
      .select("id, slug, status")
      .eq("slug", slug)
      .eq("event_id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (exErr || !existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};

    if (typeof body.displayName === "string" && body.displayName.trim().length >= 2) {
      patch.display_name = body.displayName.trim();
    }
    if (typeof body.story === "string") {
      patch.story = body.story;
    }
    if (typeof body.coverImageUrl === "string") {
      patch.cover_image_url = body.coverImageUrl.trim() || null;
    }
    if (typeof body.goalAmountCents === "number" && Number.isFinite(body.goalAmountCents) && body.goalAmountCents >= 0) {
      patch.goal_amount_cents = Math.floor(body.goalAmountCents);
    }
    if (body.status === "draft" || body.status === "active" || body.status === "paused") {
      patch.status = body.status;
    }
    if (typeof body.slug === "string" && body.slug.trim()) {
      const displayForSlug =
        typeof body.displayName === "string" && body.displayName.trim().length >= 2
          ? body.displayName.trim()
          : undefined;
      const { data: row } = await db
        .from("personal_campaigns")
        .select("display_name")
        .eq("id", existing.id)
        .single();
      const dn = displayForSlug ?? (row as { display_name?: string } | null)?.display_name ?? "fundraiser";
      patch.slug = normalizeCampaignSlug(body.slug, dn);
    }

    if (body.teamId === null) {
      patch.team_id = null;
    } else if (typeof body.teamId === "string" && isUuid(body.teamId)) {
      const { data: team, error: teamErr } = await supabaseAdmin
        .from("teams")
        .select("id, event_id")
        .eq("id", body.teamId)
        .maybeSingle();
      if (teamErr || !team || team.event_id !== eventId) {
        return NextResponse.json({ ok: false, error: "invalid_team" }, { status: 400 });
      }
      patch.team_id = team.id;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "no_updates", message: "No valid fields to update." }, { status: 400 });
    }

    const { data: updated, error: upErr } = await db
      .from("personal_campaigns")
      .update(patch)
      .eq("id", existing.id)
      .select(SELECT_FIELDS)
      .single();

    if (upErr) {
      const code = (upErr as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json(
          { ok: false, error: "slug_taken", message: "Slug already in use for this event." },
          { status: 409 },
        );
      }
      console.error("[personal-campaigns slug PATCH]", upErr);
      return NextResponse.json({ ok: false, error: "update_failed", message: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, campaign: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[personal-campaigns slug PATCH]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }): Promise<NextResponse> {
  try {
    const slug = decodeURIComponent(params.slug || "").trim();
    const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
    if (!slug || !eventId || !isUuid(eventId)) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "slug and query eventId (UUID) are required." },
        { status: 400 },
      );
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `pc_del:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!rateLimit(rlKey, 20)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const { data: existing, error: exErr } = await db
      .from("personal_campaigns")
      .select("id")
      .eq("slug", slug)
      .eq("event_id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (exErr || !existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { data: updated, error: upErr } = await db
      .from("personal_campaigns")
      .update({ status: "cancelled" })
      .eq("id", existing.id)
      .select(SELECT_FIELDS)
      .single();

    if (upErr) {
      console.error("[personal-campaigns slug DELETE]", upErr);
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, campaign: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[personal-campaigns slug DELETE]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
