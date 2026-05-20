/**
 * Notification dispatcher interface (no implementation yet).
 *
 * ADR-0008: outbid and lot-close notifications fan out from a Supabase Edge
 * Function. ADR-0003 (Web Push / VAPID) and ADR-0004 (Twilio SMS) define external
 * channels; in-app delivery uses
 * the existing `public.notifications` table.
 *
 * To avoid vendor lock-in we route all sends through this dispatcher. Sprint 4.5
 * enqueues outbid rows from the `notify-outbid` Edge Function; Sprint 4.6+ wires
 * concrete channel senders here.
 */

export type NotificationChannel = "push" | "sms" | "email" | "in_app";

export type NotificationTopic =
  | "outbid"
  | "lot_closing"
  | "won_lot"
  | "donation_received"
  | "matching_gift_confirmed";

/**
 * A request to deliver a single notification on a single channel.
 *
 * `dedupeKey` is the idempotency contract (ADR-0009). The dispatcher MUST
 * collapse repeat requests with the same `(userId, channel, dedupeKey)` into
 * a single delivery, even across retries.
 */
export interface NotificationRequest {
  userId: string;
  channel: NotificationChannel;
  topic: NotificationTopic;
  dedupeKey: string;
  /** Channel-agnostic payload; channel-specific renderers fill in the rest. */
  payload: Record<string, unknown>;
}

/** Outcome of a single dispatch attempt. */
export interface NotificationResult {
  ok: boolean;
  dedupeKey: string;
  status: "queued" | "sent" | "duplicate" | "failed";
  attempt: number;
  error?: string;
}

/** Sends via channel-specific adapters (Sprint 4.6). */
export interface NotificationDispatcher {
  dispatch(request: NotificationRequest): Promise<NotificationResult>;
  dispatchMany(requests: NotificationRequest[]): Promise<NotificationResult[]>;
}

/**
 * Convenience helper for callers to build a stable `dedupeKey` matching the
 * shape the Edge Function will use (`outbid:{lotId}:{userId}:{seq}` etc.).
 */
export function buildDedupeKey(
  topic: NotificationTopic,
  parts: ReadonlyArray<string | number>,
): string {
  if (parts.length === 0) {
    throw new TypeError("buildDedupeKey requires at least one part");
  }
  return [topic, ...parts.map(String)].join(":");
}

export { getDispatcher } from "@/lib/notifications/dispatcher-impl";
