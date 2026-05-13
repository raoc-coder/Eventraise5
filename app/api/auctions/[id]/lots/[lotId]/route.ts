import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function publishedEvent(ev: { is_published?: boolean | null } | null): boolean {
  if (!ev) return false;
  return ev.is_published !== false;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string; lotId: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const auctionId = params?.id;
    const lotId = params?.lotId;
    if (!auctionId || !lotId || !isUuid(auctionId) || !isUuid(lotId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { data: auction, error: aErr } = await supabaseAdmin
      .from("auctions")
      .select("id, event_id, status")
      .eq("id", auctionId)
      .maybeSingle();

    if (aErr || !auction || auction.status !== "published") {
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

    const { data: lot, error: lErr } = await supabaseAdmin
      .from("auction_lots")
      .select(
        "id, auction_id, title, description, display_order, starting_bid_cents, min_increment_cents, current_high_bid_cents, reserve_cents, closes_at, status, extension_count",
      )
      .eq("id", lotId)
      .eq("auction_id", auctionId)
      .maybeSingle();

    if (lErr || !lot) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lot });
  } catch (e) {
    console.error("[auction lot GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
