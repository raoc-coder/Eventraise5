import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Closes lots whose `closes_at` has passed and assigns `winning_bid_id` to the highest bid.
 * Invoke from Vercel Cron with `Authorization: Bearer ${CRON_SECRET}` (Sprint 3 / S3.4).
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

  return NextResponse.json({ ok: true, closedLots: closed });
}
