import type { SupabaseClient } from "@supabase/supabase-js";
import { captureAuctionWithVaultToken, isPracticeVaultToken } from "@/lib/auction/paypal-vault";

export type LotSettlementResult = {
  lotId: string;
  outcome: "skipped" | "settled" | "capture_failed" | "no_winner";
  error?: string;
  captureId?: string;
};

export function captureIdempotencyKeyForLot(lotId: string): string {
  return `auction_capture:${lotId}`;
}

/**
 * Capture winning bid for a closed lot (idempotent per lot).
 */
export async function settleClosedLot(
  admin: SupabaseClient,
  lotId: string,
): Promise<LotSettlementResult> {
  const { data: lot, error: lotErr } = await admin
    .from("auction_lots")
    .select(
      "id, auction_id, status, winning_bid_id, capture_idempotency_key, paypal_capture_id",
    )
    .eq("id", lotId)
    .maybeSingle();

  if (lotErr || !lot) {
    return { lotId, outcome: "skipped", error: "lot_not_found" };
  }

  if (lot.status === "settled" || lot.paypal_capture_id) {
    return { lotId, outcome: "skipped" };
  }

  if (lot.status !== "closed" && lot.status !== "capture_failed") {
    return { lotId, outcome: "skipped", error: "lot_not_closed" };
  }

  if (!lot.winning_bid_id) {
    return { lotId, outcome: "no_winner" };
  }

  const idem = lot.capture_idempotency_key || captureIdempotencyKeyForLot(lotId);

  const { data: bid, error: bidErr } = await admin
    .from("bids")
    .select("id, user_id, amount_cents")
    .eq("id", lot.winning_bid_id)
    .maybeSingle();

  if (bidErr || !bid) {
    await admin
      .from("auction_lots")
      .update({ status: "capture_failed", capture_idempotency_key: idem })
      .eq("id", lotId);
    return { lotId, outcome: "capture_failed", error: "winning_bid_missing" };
  }

  const { data: auction, error: aErr } = await admin
    .from("auctions")
    .select("id, currency")
    .eq("id", lot.auction_id)
    .maybeSingle();

  if (aErr || !auction) {
    return { lotId, outcome: "capture_failed", error: "auction_missing" };
  }

  const { data: reg, error: regErr } = await admin
    .from("auction_registrations")
    .select("payment_method_token, status")
    .eq("auction_id", lot.auction_id)
    .eq("user_id", bid.user_id)
    .maybeSingle();

  if (regErr || !reg?.payment_method_token) {
    await admin
      .from("auction_lots")
      .update({
        status: "capture_failed",
        capture_idempotency_key: idem,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lotId);
    return { lotId, outcome: "capture_failed", error: "no_vault_token" };
  }

  const currency = (auction.currency || "usd").toString();
  const capture = await captureAuctionWithVaultToken({
    paymentMethodToken: reg.payment_method_token,
    amountCents: bid.amount_cents,
    currency,
    idempotencyKey: idem,
    customId: `lot_${lotId}`,
  });

  const now = new Date().toISOString();

  if (!capture.ok) {
    await admin
      .from("auction_lots")
      .update({
        status: "capture_failed",
        capture_idempotency_key: idem,
        paypal_order_id: capture.orderId ?? null,
        updated_at: now,
      })
      .eq("id", lotId);
    return { lotId, outcome: "capture_failed", error: capture.error };
  }

  await admin
    .from("auction_lots")
    .update({
      status: "settled",
      capture_idempotency_key: idem,
      paypal_order_id: capture.orderId ?? null,
      paypal_capture_id: capture.captureId ?? null,
      updated_at: now,
    })
    .eq("id", lotId);

  return {
    lotId,
    outcome: "settled",
    captureId: capture.captureId,
  };
}

export function canBidWithoutVault(token: string | null | undefined): boolean {
  return isPracticeVaultToken(token) || process.env.AUCTION_ALLOW_PENDING_REGISTRATION === "true";
}
