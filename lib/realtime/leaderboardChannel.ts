/**
 * Supabase Realtime for P2P leaderboards (Sprint 5 / ADR-0002).
 * Subscribes to `personal_campaigns` and `teams` updates for an event.
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type LeaderboardRealtimeHandlers = {
  /** Fired when any campaign or team total changes for the event. */
  onTotalsChanged?: () => void;
  onError?: (error: unknown) => void;
};

export type LeaderboardChannelSubscription = {
  unsubscribe: () => void;
};

export function subscribeToEventLeaderboard(
  client: SupabaseClient,
  eventId: string,
  handlers: LeaderboardRealtimeHandlers,
): LeaderboardChannelSubscription {
  const notify = () => handlers.onTotalsChanged?.();

  const channel: RealtimeChannel = client
    .channel(`public:leaderboard:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "personal_campaigns",
        filter: `event_id=eq.${eventId}`,
      },
      () => notify(),
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "teams",
        filter: `event_id=eq.${eventId}`,
      },
      () => notify(),
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "personal_campaigns",
        filter: `event_id=eq.${eventId}`,
      },
      () => notify(),
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "teams",
        filter: `event_id=eq.${eventId}`,
      },
      () => notify(),
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
