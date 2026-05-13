/**
 * Supabase Realtime helpers for auction lots (Sprint 4 / ADR-0002, ADR-0012).
 *
 * Uses `postgres_changes` on `public.auction_lots` so payloads are limited to
 * row fields (no bidder identity). Clients must filter to the lots they care about.
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

/** Sanitized lot state for UI (no bidder PII). */
export interface AuctionLotPublicState {
  lotId: string;
  currentHighBidCents: number;
  closesAt: string;
  extensionCount: number;
  status?: string;
}

/** Legacy demo shape — prefer {@link AuctionLotPublicState} + postgres_changes. */
export interface BidEvent {
  id: string;
  lotId: string;
  amountCents: number;
  bidderDisplay: string;
  createdAt: string;
}

export type AuctionSystemEvent =
  | { type: "lot_opened"; lotId: string }
  | { type: "lot_extended"; lotId: string; newClosesAt: string }
  | { type: "lot_closing"; lotId: string; closesAt: string }
  | { type: "lot_closed"; lotId: string; winningBidId: string | null }
  | { type: "auction_closed"; auctionId: string };

export interface AuctionChannelHandlers {
  onBid?: (event: BidEvent) => void;
  onSystem?: (event: AuctionSystemEvent) => void;
  onLotState?: (state: AuctionLotPublicState) => void;
  onError?: (error: unknown) => void;
}

export interface AuctionChannelSubscription {
  unsubscribe: () => void;
}

function mapLotRow(row: Record<string, unknown>): AuctionLotPublicState | null {
  if (!row?.id) return null;
  return {
    lotId: String(row.id),
    currentHighBidCents: Number(row.current_high_bid_cents ?? 0),
    closesAt: String(row.closes_at ?? ""),
    extensionCount: Number(row.extension_count ?? 0),
    status: row.status != null ? String(row.status) : undefined,
  };
}

/** Subscribe to `UPDATE`s on a single lot (high bid, close time, extensions). */
export function subscribeToAuctionLot(
  client: SupabaseClient,
  lotId: string,
  handlers: Pick<AuctionChannelHandlers, "onLotState" | "onError">,
): AuctionChannelSubscription {
  const channel: RealtimeChannel = client
    .channel(`public:auction_lots:${lotId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auction_lots",
        filter: `id=eq.${lotId}`,
      },
      (payload) => {
        try {
          const next = mapLotRow((payload.new || {}) as Record<string, unknown>);
          if (next) handlers.onLotState?.(next);
        } catch (e) {
          handlers.onError?.(e);
        }
      },
    )
    .subscribe((status, err) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        handlers.onError?.(err ?? new Error(`Realtime ${status}`));
      }
    });

  return {
    unsubscribe: () => {
      void client.removeChannel(channel);
    },
  };
}

/** Subscribe to all lot updates for an auction (same sanitized payload shape). */
export function subscribeToAuctionLotsForAuction(
  client: SupabaseClient,
  auctionId: string,
  handlers: Pick<AuctionChannelHandlers, "onLotState" | "onError">,
): AuctionChannelSubscription {
  const channel: RealtimeChannel = client
    .channel(`public:auction_lots:auction:${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auction_lots",
        filter: `auction_id=eq.${auctionId}`,
      },
      (payload) => {
        try {
          const next = mapLotRow((payload.new || {}) as Record<string, unknown>);
          if (next) handlers.onLotState?.(next);
        } catch (e) {
          handlers.onError?.(e);
        }
      },
    )
    .subscribe((status, err) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        handlers.onError?.(err ?? new Error(`Realtime ${status}`));
      }
    });

  return {
    unsubscribe: () => {
      void client.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to auction-scoped lot updates (Sprint 4).
 * Pass the browser Supabase client (`lib/supabase` export).
 */
export function subscribeToAuctionChannel(
  client: SupabaseClient,
  auctionId: string,
  handlers: AuctionChannelHandlers,
): AuctionChannelSubscription {
  return subscribeToAuctionLotsForAuction(client, auctionId, {
    onLotState: handlers.onLotState,
    onError: handlers.onError,
  });
}

export function _assertRealtimeChannelType(channel: RealtimeChannel | null): void {
  void channel;
}
