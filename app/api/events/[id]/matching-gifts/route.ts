import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

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

    const { data: gift, error } = await supabaseAdmin
      .from("matching_gifts")
      .select("id, title, cap_cents, consumed_cents, multiplier, status")
      .eq("event_id", eventId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("[matching-gifts GET]", error);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, matchingGift: gift });
  } catch (e) {
    console.error("[matching-gifts GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
