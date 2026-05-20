import { NextRequest, NextResponse } from "next/server";
import { requireEventAccess } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { auctionPlatformFeeCents, sellThroughPercent } from "@/lib/auction/paypal-vault";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { data: auction, error: aErr } = await supabaseAdmin
      .from("auctions")
      .select("id, event_id, title, status")
      .eq("id", auctionId)
      .maybeSingle();

    if (aErr || !auction) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    await requireEventAccess(req, auction.event_id);

    const { data: lots, error: lErr } = await supabaseAdmin
      .from("auction_lots")
      .select("id, title, status, current_high_bid_cents, starting_bid_cents, closes_at, winning_bid_id")
      .eq("auction_id", auctionId);

    if (lErr) {
      console.error("[auction stats GET]", lErr);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }

    const list = lots ?? [];
    const gmvCents = list.reduce((s, l) => s + (l.current_high_bid_cents ?? 0), 0);
    const openLots = list.filter((l) => l.status === "open").length;
    const closedLots = list.filter(
      (l) => l.status === "closed" || l.status === "settled" || l.status === "capture_failed",
    ).length;
    const settledLots = list.filter((l) => l.status === "settled").length;
    const withWinner = list.filter((l) => l.winning_bid_id).length;
    const platformFeeCents = auctionPlatformFeeCents(gmvCents);
    const sellThroughPct = sellThroughPercent(withWinner, list.length);

    return NextResponse.json({
      ok: true,
      auction: { id: auction.id, title: auction.title, status: auction.status },
      gmvCents,
      platformFeeCents,
      sellThroughPct,
      lotCount: list.length,
      openLots,
      closedLots,
      settledLots,
      lots: list,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[auction stats GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
