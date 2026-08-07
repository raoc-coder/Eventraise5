import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function idempotencyKey(req: NextRequest): string | null {
  const a = req.headers.get("idempotency-key")?.trim();
  const b = req.headers.get("Idempotency-Key")?.trim();
  const v = a || b || null;
  if (!v || v.length > 200) return null;
  return v;
}

export async function POST(req: NextRequest, { params }: { params: { id: string; lotId: string } }): Promise<NextResponse> {
  try {
    const auctionId = params?.id;
    const lotId = params?.lotId;
    if (!auctionId || !lotId || !isUuid(auctionId) || !isUuid(lotId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const idem = idempotencyKey(req);
    if (!idem) {
      return NextResponse.json(
        { ok: false, error: "missing_idempotency_key", message: "Send Idempotency-Key header (max 200 chars)." },
        { status: 400 },
      );
    }

    const { user, db } = await requireAuth(req);
    const rlKey = `bid:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 60))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const raw = body && typeof body === "object" ? (body as { amountCents?: unknown }).amountCents : undefined;
    const amountCents =
      typeof raw === "number" && Number.isFinite(raw) ? Math.floor(raw) : Number.NaN;
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }

    const { data, error } = await db.rpc("place_auction_bid", {
      p_lot_id: lotId,
      p_amount_cents: amountCents,
      p_idempotency_key: idem,
    });

    if (error) {
      console.error("[auction bids POST] rpc", error);
      return NextResponse.json({ ok: false, error: "rpc_failed", message: error.message }, { status: 500 });
    }

    const result = data as Record<string, unknown> | null;
    if (!result || result.ok !== true) {
      const err = typeof result?.error === "string" ? result.error : "bid_rejected";
      const status =
        err === "unauthorized"
          ? 401
          : err === "lot_not_found" || err === "lot_not_open" || err === "lot_closed"
            ? 409
            : err === "below_increment"
              ? 400
              : err === "not_registered"
                ? 403
                : 400;
      return NextResponse.json({ ok: false, ...result }, { status });
    }

    const res = NextResponse.json({
      ok: true,
      bidId: result.bid_id,
      replay: result.replay === true,
      lotExtended: result.lot_extended === true,
      closesAt: result.closes_at,
      extensionCount: result.extension_count,
    });
    res.headers.set("Idempotency-Key", idem);
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[auction bids POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
