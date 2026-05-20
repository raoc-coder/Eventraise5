import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { createVaultSetupToken } from "@/lib/auction/paypal-vault";
import { isUuid } from "@/lib/p2p/personal-campaigns";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const auctionId = params?.id;
    if (!auctionId || !isUuid(auctionId)) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    await requireAuth(req);

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
