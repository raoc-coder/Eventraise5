import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { createVaultPaymentToken } from "@/lib/auction/paypal-vault";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

function idempotencyKey(req: NextRequest): string | null {
  const a = req.headers.get("idempotency-key")?.trim();
  const b = req.headers.get("Idempotency-Key")?.trim();
  const v = a || b || null;
  if (!v || v.length > 200) return null;
  return v;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const idem = idempotencyKey(req);
    if (!idem) {
      return NextResponse.json(
        { ok: false, error: "missing_idempotency_key", message: "Send Idempotency-Key header." },
        { status: 400 },
      );
    }

    const { user } = await requireAuth(req);
    const rlKey = `vault_confirm:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 15))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const setupTokenId =
      typeof (body as { setupTokenId?: unknown }).setupTokenId === "string"
        ? String((body as { setupTokenId: string }).setupTokenId).trim()
        : "";

    if (!setupTokenId) {
      return NextResponse.json({ ok: false, error: "invalid_request", message: "setupTokenId required." }, { status: 400 });
    }

    const vaulted = await createVaultPaymentToken(setupTokenId);
    if (!vaulted.ok || !vaulted.paymentMethodToken) {
      return NextResponse.json(
        { ok: false, error: "vault_confirm_failed", message: vaulted.error },
        { status: 502 },
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("auction_registrations")
      .select("id, status")
      .eq("auction_id", auctionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("auction_registrations")
        .update({
          payment_method_token: vaulted.paymentMethodToken,
          status: "active",
        })
        .eq("id", existing.id)
        .select("id, status, created_at")
        .single();

      if (upErr) {
        return NextResponse.json({ ok: false, error: "update_failed", message: upErr.message }, { status: 500 });
      }

      const res = NextResponse.json({ ok: true, registration: updated, replay: false });
      res.headers.set("Idempotency-Key", idem);
      return res;
    }

    const { data: created, error: insErr } = await supabaseAdmin
      .from("auction_registrations")
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        payment_method_token: vaulted.paymentMethodToken,
        status: "active",
        client_idempotency_key: idem,
      })
      .select("id, status, created_at")
      .single();

    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        const { data: dup } = await supabaseAdmin
          .from("auction_registrations")
          .select("id, status, created_at")
          .eq("auction_id", auctionId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (dup) {
          const res = NextResponse.json({ ok: true, registration: dup, replay: true });
          res.headers.set("Idempotency-Key", idem);
          return res;
        }
      }
      return NextResponse.json({ ok: false, error: "insert_failed", message: insErr.message }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, registration: created });
    res.headers.set("Idempotency-Key", idem);
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[vault confirm]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
