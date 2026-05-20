import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function isPublished(event: { is_published?: boolean | null }): boolean {
  return event.is_published === true;
}

/**
 * Public donor wall for published events (Sprint 5.3).
 * Reads from `donor_wall_feed` — no donor email or user ids.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
  if (!eventId || !isUuid(eventId)) {
    return NextResponse.json({ ok: false, error: "invalid_event_id" }, { status: 400 });
  }

  const limRaw = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limRaw) ? Math.min(50, Math.max(1, Math.floor(limRaw))) : 20;

  const { data: ev, error: evErr } = await supabaseAdmin
    .from("events")
    .select("id, is_published")
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !ev || !isPublished(ev)) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data: rows, error } = await supabaseAdmin
    .from("donor_wall_feed")
    .select("id, event_id, amount_cents, display_name, message, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[donor-wall GET]", error);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  const donors = (rows ?? []).map((r) => ({
    id: r.id,
    name: r.display_name,
    amountCents: r.amount_cents,
    comment: r.message,
    ts: r.created_at,
  }));

  return NextResponse.json({ ok: true, donors });
}
