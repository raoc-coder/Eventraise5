/**
 * Realtime subscription helper for live auctions (placeholder).
 *
 * ADR-0002: live updates ride on Supabase Realtime via `postgres_changes` on
 * `public.bids` plus `broadcast` for system events like `lot_closing` and
 * `lot_extended` (anti-snipe; see ADR-0007). ADR-0012 requires that any
 * payload exposed through Realtime is sanitized (no `bidder_id`, no PII).
 *
 * This stub establishes the public surface; the implementation lands in
 * Sprint 5 alongside the notification fan-out Edge Function.
 */

import type { RealtimeChannel } from "@supabase/supabase-js";

/** Sanitized bid event delivered to clients via Realtime (ADR-0012). */
export interface BidEvent {
  id: string;
  lotId: string;
  amountCents: number;
  bidderDisplay: string;
  createdAt: string;
}

/** System events broadcast by the server (not derived from row changes). */
export type AuctionSystemEvent =
  | { type: "lot_opened"; lotId: string }
  | { type: "lot_extended"; lotId: string; newClosesAt: string }
  | { type: "lot_closing"; lotId: string; closesAt: string }
  | { type: "lot_closed"; lotId: string; winningBidId: string | null }
  | { type: "auction_closed"; auctionId: string };

export interface AuctionChannelHandlers {
  onBid?: (event: BidEvent) => void;
  onSystem?: (event: AuctionSystemEvent) => void;
  onError?: (error: unknown) => void;
}

export interface AuctionChannelSubscription {
  /** Tear down the subscription. Safe to call multiple times. */
  unsubscribe: () => void;
}

/**
 * Subscribe to the realtime channel for a given auction.
 *
 * NOTE: implementation is intentionally deferred to Sprint 5 (ADR-0002 /
 * ADR-0008). This stub is here so Sprint 1–4 surfaces can import a stable
 * type without forcing the client to know about Supabase channel mechanics.
 */
export function subscribeToAuctionChannel(
  _auctionId: string,
  _handlers: AuctionChannelHandlers,
): AuctionChannelSubscription {
  // Intentionally a no-op. Sprint 5 wires this to supabase.channel(...).
  // Returning a stable unsubscribe lets callers code against the final shape now.
  return {
    unsubscribe: () => {
      /* no-op until Sprint 5 */
    },
  };
}

/** Internal helper kept exported for the Sprint 5 implementation/tests. */
export function _assertRealtimeChannelType(channel: RealtimeChannel | null): void {
  void channel;
}
