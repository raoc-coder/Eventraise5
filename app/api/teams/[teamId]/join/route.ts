import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function isPublished(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function POST(_req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const teamId = params?.teamId;
    if (!teamId || !isUuid(teamId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user, db } = await requireAuth(_req);
    const rlKey = `team_join:${user.id}:${getClientKeyFromHeaders(_req.headers)}`;
    if (!rateLimit(rlKey, 40)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const { data: team, error: tErr } = await supabaseAdmin
      .from("teams")
      .select("id, event_id")
      .eq("id", teamId)
      .maybeSingle();

    if (tErr || !team) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", team.event_id)
      .maybeSingle();

    if (evErr || !ev || !isPublished(ev)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { error: insErr } = await db.from("team_members").insert({ team_id: teamId, user_id: user.id });

    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json({ ok: true, joined: true, alreadyMember: true });
      }
      console.error("[teams join POST]", insErr);
      return NextResponse.json({ ok: false, error: "insert_failed", message: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, joined: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[teams join POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
