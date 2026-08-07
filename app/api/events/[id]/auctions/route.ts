import { NextRequest, NextResponse } from "next/server";
import { requireEventAccess } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { normalizeCampaignSlug } from "@/lib/p2p/slug";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { db } = await requireEventAccess(req, eventId);
    const { data, error } = await db
      .from("auctions")
      .select("id, event_id, title, slug, status, mode, anti_snipe_enabled, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[events auctions GET]", error);
      return NextResponse.json({ ok: false, error: "query_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, auctions: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[events auctions GET]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const eventId = params?.id;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user, db } = await requireEventAccess(req, eventId);
    const rlKey = `auction_create:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 15))) {
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

    const slug = normalizeCampaignSlug(typeof body.slug === "string" ? body.slug : undefined, title);
    const mode = body.mode === "live" ? "live" : "silent";
    const antiSnipeEnabled = body.antiSnipeEnabled === true;
    const status = body.status === "published" || body.status === "draft" ? body.status : "draft";

    const { data: created, error } = await db
      .from("auctions")
      .insert({
        event_id: eventId,
        title,
        slug,
        mode,
        anti_snipe_enabled: antiSnipeEnabled,
        status,
        created_by: user.id,
      })
      .select("id, event_id, title, slug, status, mode, anti_snipe_enabled, created_at")
      .single();

    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json({ ok: false, error: "slug_taken" }, { status: 409 });
      }
      console.error("[events auctions POST]", error);
      return NextResponse.json({ ok: false, error: "insert_failed", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, auction: created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (msg === "Forbidden") {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[events auctions POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
