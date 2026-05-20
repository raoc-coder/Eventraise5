import { NextRequest, NextResponse } from "next/server";
import { requireEventAccess } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function escapeCsv(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return new NextResponse("Database unavailable", { status: 500 });
    }

    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return new NextResponse("Invalid auction id", { status: 400 });
    }

    const { data: auction, error: aErr } = await supabaseAdmin
      .from("auctions")
      .select("id, event_id, title")
      .eq("id", auctionId)
      .maybeSingle();

    if (aErr || !auction) {
      return new NextResponse("Not found", { status: 404 });
    }

    await requireEventAccess(req, auction.event_id);

    const { data: lots, error: lErr } = await supabaseAdmin
      .from("auction_lots")
      .select(
        "id, title, status, current_high_bid_cents, closes_at, winning_bid_id, paypal_capture_id",
      )
      .eq("auction_id", auctionId)
      .order("display_order", { ascending: true });

    if (lErr) {
      return new NextResponse(lErr.message, { status: 500 });
    }

    const winIds = (lots ?? []).map((l) => l.winning_bid_id).filter(Boolean) as string[];
    let bidsById: Record<string, { amount_cents: number; user_id: string }> = {};

    if (winIds.length > 0) {
      const { data: bids } = await supabaseAdmin
        .from("bids")
        .select("id, amount_cents, user_id")
        .in("id", winIds);
      for (const b of bids ?? []) {
        bidsById[b.id] = { amount_cents: b.amount_cents, user_id: b.user_id };
      }
    }

    const headers = [
      "lot_id",
      "lot_title",
      "status",
      "closes_at",
      "winning_amount_cents",
      "winner_user_id",
      "paypal_capture_id",
    ];
    const lines = [headers.join(",")];

    for (const lot of lots ?? []) {
      const win = lot.winning_bid_id ? bidsById[lot.winning_bid_id] : null;
      lines.push(
        [
          lot.id,
          lot.title,
          lot.status,
          lot.closes_at,
          win?.amount_cents ?? "",
          win?.user_id ?? "",
          lot.paypal_capture_id ?? "",
        ]
          .map(escapeCsv)
          .join(","),
      );
    }

    const csv = lines.join("\n");
    const slug = (auction.title || "auction").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    const filename = `auction_${slug}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Authentication required") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (msg === "Forbidden") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse(msg, { status: 500 });
  }
}
