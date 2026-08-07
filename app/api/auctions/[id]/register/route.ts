import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { isPayPalSandboxServer } from "@/lib/paypal-env";
import { supabaseAdmin } from "@/lib/supabase";

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
    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
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
    const rlKey = `auction_reg:${user.id}:${getClientKeyFromHeaders(req.headers)}`;
    if (!(await rateLimit(rlKey, 20))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const practiceVault = !!(body as { practiceVault?: boolean }).practiceVault;
    // Sprint 7: reject arbitrary client paymentMethodToken — vault tokens come
    // only from /vault/confirm (or sandbox practice_vault).
    const clientToken =
      typeof (body as { paymentMethodToken?: unknown }).paymentMethodToken === "string"
        ? String((body as { paymentMethodToken: string }).paymentMethodToken).trim() || null
        : null;

    if (clientToken && clientToken !== "practice_vault") {
      return NextResponse.json(
        {
          ok: false,
          error: "token_not_allowed",
          message: "Payment method tokens must be created via vault confirm, not posted directly.",
        },
        { status: 400 },
      );
    }

    const token = practiceVault ? "practice_vault" : null;

    if (practiceVault && !isPayPalSandboxServer()) {
      return NextResponse.json(
        { ok: false, error: "practice_not_allowed", message: "Practice registration is disabled in production." },
        { status: 400 },
      );
    }

    // Prefer existing vault-confirmed registration for this user/auction.
    if (!practiceVault && supabaseAdmin) {
      const { data: vaulted } = await supabaseAdmin
        .from("auction_vault_setups")
        .select("payment_method_token, status")
        .eq("auction_id", auctionId)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .order("confirmed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (vaulted?.payment_method_token) {
        const row = {
          auction_id: auctionId,
          user_id: user.id,
          payment_method_token: vaulted.payment_method_token,
          status: "active",
          client_idempotency_key: idem,
        };
        const { data, error } = await db
          .from("auction_registrations")
          .insert(row)
          .select("id, status, created_at")
          .single();
        if (error) {
          const code = (error as { code?: string }).code;
          if (code === "23505") {
            const { data: existing } = await db
              .from("auction_registrations")
              .select("id, status, created_at")
              .eq("auction_id", auctionId)
              .eq("user_id", user.id)
              .maybeSingle();
            if (existing) {
              const res = NextResponse.json({ ok: true, registration: existing, replay: true });
              res.headers.set("Idempotency-Key", idem);
              return res;
            }
          }
          return NextResponse.json({ ok: false, error: "insert_failed", message: error.message }, { status: 500 });
        }
        const res = NextResponse.json({ ok: true, registration: data });
        res.headers.set("Idempotency-Key", idem);
        return res;
      }
    }

    const row = {
      auction_id: auctionId,
      user_id: user.id,
      payment_method_token: token,
      status: token ? "active" : "pending",
      client_idempotency_key: idem,
    };

    const { data, error } = await db.from("auction_registrations").insert(row).select("id, status, created_at").single();

    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        const { data: existing } = await db
          .from("auction_registrations")
          .select("id, status, created_at")
          .eq("auction_id", auctionId)
          .eq("user_id", user.id)
          .eq("client_idempotency_key", idem)
          .maybeSingle();
        if (existing) {
          const res = NextResponse.json({ ok: true, registration: existing, replay: true });
          res.headers.set("Idempotency-Key", idem);
          return res;
        }
        const { data: dupUser } = await db
          .from("auction_registrations")
          .select("id, status, created_at")
          .eq("auction_id", auctionId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (dupUser) {
          return NextResponse.json({ ok: true, registration: dupUser, replay: true });
        }
      }
      console.error("[auction register POST]", error);
      return NextResponse.json({ ok: false, error: "insert_failed", message: error.message }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, registration: data });
    res.headers.set("Idempotency-Key", idem);
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[auction register POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
