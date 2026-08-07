import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { normalizeCampaignSlug } from "@/lib/p2p/slug";

export const dynamic = "force-dynamic";

function idempotencyKey(req: NextRequest): string | null {
  const a = req.headers.get("idempotency-key")?.trim();
  const b = req.headers.get("Idempotency-Key")?.trim();
  const v = a || b || null;
  if (!v || v.length > 200) return null;
  return v;
}

function isPublished(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, db } = await requireAuth(req);
    const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "Query eventId (UUID) is required." },
        { status: 400 },
      );
    }

    const { data, error } = await db
      .from("personal_campaigns")
      .select(
        "id, event_id, owner_id, team_id, slug, display_name, story, goal_amount_cents, total_raised_cents, cover_image_url, status, created_at, updated_at, client_idempotency_key",
      )
      .eq("event_id", eventId)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[personal-campaigns GET]", error);
      return NextResponse.json(
        { ok: false, error: "query_failed", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, campaigns: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[personal-campaigns GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const idem = idempotencyKey(req);
    if (!idem) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing_idempotency_key",
          message: "Send a non-empty Idempotency-Key header (max 200 chars).",
        },
        { status: 400 },
      );
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `pc_post:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 30))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (!eventId || !isUuid(eventId) || displayName.length < 2) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "eventId (UUID) and displayName (min 2 chars) required." },
        { status: 400 },
      );
    }

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", eventId)
      .maybeSingle();

    if (evErr || !ev || !isPublished(ev)) {
      return NextResponse.json(
        { ok: false, error: "event_not_found", message: "Event not found or not published." },
        { status: 404 },
      );
    }

    const story = typeof body.story === "string" ? body.story : null;
    const coverImageUrl =
      typeof body.coverImageUrl === "string" && body.coverImageUrl.trim()
        ? body.coverImageUrl.trim()
        : null;
    const goalRaw = body.goalAmountCents;
    const goalAmountCents =
      typeof goalRaw === "number" && Number.isFinite(goalRaw) && goalRaw >= 0
        ? Math.floor(goalRaw)
        : 0;
    const status =
      body.status === "draft" || body.status === "active" ? body.status : "active";
    const slug = normalizeCampaignSlug(
      typeof body.slug === "string" ? body.slug : undefined,
      displayName,
    );

    let teamId: string | null = null;
    if (body.teamId != null) {
      if (typeof body.teamId !== "string" || !isUuid(body.teamId)) {
        return NextResponse.json({ ok: false, error: "invalid_team_id" }, { status: 400 });
      }
      const { data: team, error: teamErr } = await supabaseAdmin
        .from("teams")
        .select("id, event_id")
        .eq("id", body.teamId)
        .maybeSingle();
      if (teamErr || !team || team.event_id !== eventId) {
        return NextResponse.json({ ok: false, error: "invalid_team" }, { status: 400 });
      }
      teamId = team.id;
    }

    const insertRow = {
      event_id: eventId,
      owner_id: user.id,
      team_id: teamId,
      slug,
      display_name: displayName,
      story,
      goal_amount_cents: goalAmountCents,
      cover_image_url: coverImageUrl,
      status,
      client_idempotency_key: idem,
    };

    const { data: created, error: insErr } = await db
      .from("personal_campaigns")
      .insert(insertRow)
      .select(
        "id, event_id, owner_id, team_id, slug, display_name, story, goal_amount_cents, total_raised_cents, cover_image_url, status, created_at, updated_at",
      )
      .single();

    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        const { data: replay } = await db
          .from("personal_campaigns")
          .select(
            "id, event_id, owner_id, team_id, slug, display_name, story, goal_amount_cents, total_raised_cents, cover_image_url, status, created_at, updated_at",
          )
          .eq("owner_id", user.id)
          .eq("client_idempotency_key", idem)
          .maybeSingle();
        if (replay) {
          const res = NextResponse.json({ ok: true, campaign: replay, replay: true });
          res.headers.set("Idempotency-Key", idem);
          return res;
        }
        return NextResponse.json(
          { ok: false, error: "slug_taken", message: "Slug already in use for this event." },
          { status: 409 },
        );
      }
      console.error("[personal-campaigns POST]", insErr);
      return NextResponse.json(
        { ok: false, error: "insert_failed", message: insErr.message },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ ok: true, campaign: created });
    res.headers.set("Idempotency-Key", idem);
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[personal-campaigns POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
