import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function isPublished(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const scope = (req.nextUrl.searchParams.get("scope") || "all").toLowerCase();
    const limRaw = Number(req.nextUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limRaw)
      ? Math.min(50, Math.max(1, Math.floor(limRaw)))
      : 20;

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", eventId)
      .maybeSingle();

    if (evErr || !ev || !isPublished(ev)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const out: {
      individuals: unknown[];
      teams: unknown[];
    } = { individuals: [], teams: [] };

    if (scope === "all" || scope === "individual" || scope === "individuals") {
      const { data: individuals, error: iErr } = await supabaseAdmin
        .from("personal_campaigns")
        .select("id, slug, display_name, total_raised_cents, goal_amount_cents, team_id")
        .eq("event_id", eventId)
        .eq("status", "active")
        .order("total_raised_cents", { ascending: false })
        .limit(limit);

      if (iErr) {
        console.error("[leaderboard GET] individuals", iErr);
        return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
      }
      out.individuals = individuals ?? [];
    }

    if (scope === "all" || scope === "team" || scope === "teams") {
      const { data: teams, error: tErr } = await supabaseAdmin
        .from("teams")
        .select("id, name, slug, total_raised_cents, team_members(count)")
        .eq("event_id", eventId)
        .order("total_raised_cents", { ascending: false })
        .limit(limit);

      if (tErr) {
        console.error("[leaderboard GET] teams", tErr);
        return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
      }

      out.teams = (teams ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        total_raised_cents: t.total_raised_cents,
        member_count: Array.isArray(t.team_members) ? t.team_members[0]?.count ?? 0 : 0,
      }));
    }

    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    console.error("[leaderboard GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
