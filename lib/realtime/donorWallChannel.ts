/**
 * Realtime donor wall (Sprint 5) — `donor_wall_feed` rows only (ADR-0012).
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type DonorWallEntry = {
  id: string;
  eventId: string;
  amountCents: number;
  displayName: string;
  message: string | null;
  createdAt: string;
};

export type DonorWallHandlers = {
  onEntry?: (entry: DonorWallEntry) => void;
  onError?: (error: unknown) => void;
};

export type DonorWallSubscription = {
  unsubscribe: () => void;
};

function mapRow(row: Record<string, unknown>): DonorWallEntry | null {
  if (!row?.id || !row?.event_id) return null;
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    amountCents: Number(row.amount_cents ?? 0),
    displayName: String(row.display_name ?? "Anonymous"),
    message: row.message != null ? String(row.message) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export function subscribeToDonorWall(
  client: SupabaseClient,
  eventId: string,
  handlers: DonorWallHandlers,
): DonorWallSubscription {
  const channel: RealtimeChannel = client
    .channel(`public:donor_wall:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "donor_wall_feed",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        try {
          const entry = mapRow((payload.new || {}) as Record<string, unknown>);
          if (entry) handlers.onEntry?.(entry);
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
