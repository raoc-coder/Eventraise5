import { NextRequest, NextResponse } from "next/server";
import { requireEventAccess } from "@/lib/auth-utils";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; auctionId: string } },
): Promise<NextResponse> {
  try {
    const eventId = params?.id;
    const auctionId = params?.auctionId;
    if (!eventId || !auctionId || !isUuid(eventId) || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { db } = await requireEventAccess(req, eventId);
    const { data: auction, error: aErr } = await db
      .from("auctions")
      .select("id, event_id, title, slug, status, mode, anti_snipe_enabled, created_at")
      .eq("id", auctionId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (aErr || !auction) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const { data: lots, error: lErr } = await db
      .from("auction_lots")
      .select(
        "id, auction_id, title, description, display_order, starting_bid_cents, min_increment_cents, current_high_bid_cents, closes_at, status, extension_count",
      )
      .eq("auction_id", auctionId)
      .order("display_order", { ascending: true });

    if (lErr) {
      console.error("[events auctions detail GET]", lErr);
      return NextResponse.json({ ok: false, error: "query_failed", message: lErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, auction, lots: lots ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[events auctions detail GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; auctionId: string } },
): Promise<NextResponse> {
  try {
    const eventId = params?.id;
    const auctionId = params?.auctionId;
    if (!eventId || !auctionId || !isUuid(eventId) || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const { db } = await requireEventAccess(req, eventId);
    const update: Record<string, unknown> = {};
    if (body.status === "published" || body.status === "draft" || body.status === "closed") {
      update.status = body.status;
    }
    if (typeof body.title === "string" && body.title.trim().length >= 2) {
      update.title = body.title.trim();
    }
    if (body.mode === "live" || body.mode === "silent") {
      update.mode = body.mode;
    }
    if (typeof body.antiSnipeEnabled === "boolean") {
      update.anti_snipe_enabled = body.antiSnipeEnabled;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });
    }

    const { data, error } = await db
      .from("auctions")
      .update(update)
      .eq("id", auctionId)
      .eq("event_id", eventId)
      .select("id, event_id, title, slug, status, mode, anti_snipe_enabled, created_at")
      .single();

    if (error || !data) {
      console.error("[events auctions PATCH]", error);
      return NextResponse.json({ ok: false, error: "update_failed", message: error?.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, auction: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[events auctions PATCH]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
