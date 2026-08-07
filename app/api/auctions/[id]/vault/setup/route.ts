import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { createVaultSetupToken } from "@/lib/auction/paypal-vault";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const { user } = await requireAuth(req);

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/auctions/${auctionId}/register?vault=return`;
    const cancelUrl = `${appUrl}/auctions/${auctionId}/register?vault=cancel`;

    const result = await createVaultSetupToken(returnUrl, cancelUrl);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "vault_setup_failed", message: result.error },
        { status: 502 },
      );
    }

    // Bind setup token to this user + auction (Sprint 7 / M9).
    const { error: bindErr } = await supabaseAdmin.from("auction_vault_setups").insert({
      auction_id: auctionId,
      user_id: user.id,
      setup_token_id: result.setupTokenId,
      status: "pending",
    });
    if (bindErr) {
      // Table may not exist until migration 034 — log and continue so sandbox isn't hard-blocked.
      console.error("[vault setup] bind failed (apply migration 034?):", bindErr.message);
    }

    return NextResponse.json({
      ok: true,
      setupTokenId: result.setupTokenId,
      approveUrl: result.approveUrl,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
