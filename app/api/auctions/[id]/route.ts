import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function publishedEvent(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { data: auction, error } = await supabaseAdmin
      .from("auctions")
      .select("id, event_id, title, slug, currency, status, mode, anti_snipe_enabled, created_at")
      .eq("id", auctionId)
      .maybeSingle();

    if (error || !auction) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    if (auction.status !== "published") {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", auction.event_id)
      .maybeSingle();

    if (evErr || !publishedEvent(ev)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, auction });
  } catch (e) {
    console.error("[auctions GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
