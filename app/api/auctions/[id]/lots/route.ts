import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";

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

    const { data: lots, error: lErr } = await supabaseAdmin
      .from("auction_lots")
      .select(
        "id, auction_id, title, description, display_order, starting_bid_cents, min_increment_cents, current_high_bid_cents, reserve_cents, closes_at, status, extension_count",
      )
      .eq("auction_id", auctionId)
      .order("display_order", { ascending: true });

    if (lErr) {
      console.error("[auctions lots GET]", lErr);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lots: lots ?? [] });
  } catch (e) {
    console.error("[auctions lots GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `lot_create:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!rateLimit(rlKey, 30)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (title.length < 2) {
      return NextResponse.json({ ok: false, error: "invalid_title" }, { status: 400 });
    }

    const startingBidCents =
      typeof body.startingBidCents === "number" && Number.isFinite(body.startingBidCents)
        ? Math.max(0, Math.floor(body.startingBidCents))
        : 0;
    const minIncrementCents =
      typeof body.minIncrementCents === "number" && Number.isFinite(body.minIncrementCents)
        ? Math.max(1, Math.floor(body.minIncrementCents))
        : 100;
    const closesAt = typeof body.closesAt === "string" ? body.closesAt.trim() : "";
    if (!closesAt) {
      return NextResponse.json({ ok: false, error: "missing_closes_at" }, { status: 400 });
    }

    const description = typeof body.description === "string" ? body.description : null;
    const displayOrder =
      typeof body.displayOrder === "number" && Number.isFinite(body.displayOrder)
        ? Math.floor(body.displayOrder)
        : 0;
    const status = body.status === "open" || body.status === "draft" ? body.status : "draft";

    const { data: lot, error } = await db
      .from("auction_lots")
      .insert({
        auction_id: auctionId,
        title,
        description,
        display_order: displayOrder,
        starting_bid_cents: startingBidCents,
        min_increment_cents: minIncrementCents,
        closes_at: closesAt,
        status,
      })
      .select(
        "id, auction_id, title, description, display_order, starting_bid_cents, min_increment_cents, current_high_bid_cents, closes_at, status",
      )
      .single();

    if (error) {
      console.error("[auctions lots POST]", error);
      return NextResponse.json({ ok: false, error: "insert_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lot });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[auctions lots POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
