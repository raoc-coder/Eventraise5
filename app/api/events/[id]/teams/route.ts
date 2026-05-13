import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { normalizeCampaignSlug } from "@/lib/p2p/slug";

export const dynamic = "force-dynamic";

function isPublished(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }
    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", eventId)
      .maybeSingle();

    if (evErr || !ev || !isPublished(ev)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { data: teams, error } = await supabaseAdmin
      .from("teams")
      .select("id, event_id, name, slug, total_raised_cents, created_at, team_members(count)")
      .eq("event_id", eventId)
      .order("total_raised_cents", { ascending: false });

    if (error) {
      console.error("[events teams GET]", error);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }

    const shaped = (teams ?? []).map((t: any) => ({
      id: t.id,
      event_id: t.event_id,
      name: t.name,
      slug: t.slug,
      total_raised_cents: t.total_raised_cents,
      created_at: t.created_at,
      member_count: Array.isArray(t.team_members) ? t.team_members[0]?.count ?? 0 : 0,
    }));

    return NextResponse.json({ ok: true, teams: shaped });
  } catch (e) {
    console.error("[events teams GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `teams_post:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!rateLimit(rlKey, 20)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", eventId)
      .maybeSingle();

    if (evErr || !ev || !isPublished(ev)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "invalid_request", message: "name (min 2 chars) required." }, { status: 400 });
    }

    const slug = normalizeCampaignSlug(typeof body.slug === "string" ? body.slug : undefined, name);

    const { data: created, error: insErr } = await db
      .from("teams")
      .insert({
        event_id: eventId,
        name,
        slug,
        created_by: user.id,
      })
      .select("id, event_id, name, slug, total_raised_cents, created_at")
      .single();

    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json(
          { ok: false, error: "slug_taken", message: "Team slug already in use for this event." },
          { status: 409 },
        );
      }
      console.error("[events teams POST]", insErr);
      return NextResponse.json({ ok: false, error: "insert_failed", message: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, team: created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[events teams POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
