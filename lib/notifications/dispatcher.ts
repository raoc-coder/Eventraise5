/**
 * Notification dispatcher interface (no implementation yet).
 *
 * ADR-0008: outbid and lot-close notifications fan out from a Supabase Edge
 * Function. ADR-0003 (Web Push / VAPID), ADR-0004 (Twilio SMS), and ADR-0005
 * (SendGrid email) define the three external channels; in-app delivery uses
 * the existing `public.notifications` table.
 *
 * To avoid vendor lock-in we route all sends through this dispatcher. Sprint 5
 * will provide concrete implementations and an Edge Function entry point.
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

/**
 * The Sprint 5 implementation will provide a concrete class that writes to
 * `public.notification_deliveries`, calls the channel-specific senders, and
 * surfaces metrics for the SLO dashboards (ADR-0014).
 */
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

/**
 * Throw-on-call placeholder so any accidental import path that tries to
 * actually send during Sprints 1–4 fails fast in dev, rather than silently
 * doing nothing.
 */
export function getDispatcher(): NotificationDispatcher {
  throw new Error(
    "NotificationDispatcher is not yet wired (Sprint 5 / ADR-0008). " +
      "Import the interface only until then.",
  );
}
