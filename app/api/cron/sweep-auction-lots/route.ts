import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { settleClosedLot } from "@/lib/auction/settle-lot";

export const dynamic = "force-dynamic";

/**
 * Closes due lots, assigns winning_bid_id, then captures vaulted winners (S3.3 / S3.4).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cron_not_configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { data: due, error: qErr } = await supabaseAdmin
    .from("auction_lots")
    .select("id")
    .eq("status", "open")
    .lte("closes_at", now);

  if (qErr) {
    console.error("[cron sweep-auction-lots]", qErr);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  let closed = 0;
  for (const row of due ?? []) {
    const lotId = row.id as string;
    const { data: top } = await supabaseAdmin
      .from("bids")
      .select("id")
      .eq("lot_id", lotId)
      .order("amount_cents", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { error: uErr } = await supabaseAdmin
      .from("auction_lots")
      .update({
        status: "closed",
        winning_bid_id: top?.id ?? null,
        updated_at: now,
      })
      .eq("id", lotId)
      .eq("status", "open");

    if (!uErr) closed += 1;
  }

  const { data: toSettle } = await supabaseAdmin
    .from("auction_lots")
    .select("id")
    .in("status", ["closed", "capture_failed"])
    .not("winning_bid_id", "is", null)
    .is("paypal_capture_id", null)
    .limit(100);

  const settlements: { lotId: string; outcome: string; error?: string }[] = [];
  for (const row of toSettle ?? []) {
    const result = await settleClosedLot(supabaseAdmin, row.id as string);
    settlements.push({
      lotId: result.lotId,
      outcome: result.outcome,
      error: result.error,
    });
  }

  return NextResponse.json({
    ok: true,
    closedLots: closed,
    settlements,
  });
}
