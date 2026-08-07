import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireEventAccess } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
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

/** Organizer: create or replace the active matching gift for an event. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user } = await requireEventAccess(req, eventId);
    const rlKey = `matching_gift_post:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 10))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "Matching gift";
    const capDollars = Number(body.capDollars ?? body.cap_dollars);
    const multiplier = Number(body.multiplier ?? 1);
    if (!Number.isFinite(capDollars) || capDollars <= 0) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "capDollars must be positive." },
        { status: 400 },
      );
    }
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      return NextResponse.json(
        { ok: false, error: "invalid_request", message: "multiplier must be positive." },
        { status: 400 },
      );
    }

    const cap_cents = Math.round(capDollars * 100);

    await supabaseAdmin
      .from("matching_gifts")
      .update({ status: "paused" })
      .eq("event_id", eventId)
      .eq("status", "active");

    const { data: created, error } = await supabaseAdmin
      .from("matching_gifts")
      .insert({
        event_id: eventId,
        title: title || "Matching gift",
        cap_cents,
        multiplier,
        status: "active",
      })
      .select("id, title, cap_cents, consumed_cents, multiplier, status")
      .single();

    if (error) {
      console.error("[matching-gifts POST]", error);
      return NextResponse.json({ ok: false, error: "insert_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, matchingGift: created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[matching-gifts POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
