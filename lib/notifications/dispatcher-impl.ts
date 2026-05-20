import type {
  NotificationDispatcher,
  NotificationRequest,
  NotificationResult,
} from "@/lib/notifications/dispatcher";
import { sendDeliveryRow, type DeliveryRow } from "@/lib/notifications/send-delivery";

class DefaultNotificationDispatcher implements NotificationDispatcher {
  async dispatch(request: NotificationRequest): Promise<NotificationResult> {
    const row: DeliveryRow = {
      id: "inline",
      dedupe_key: request.dedupeKey,
      channel: request.channel,
      status: "pending",
      payload: { ...request.payload, outbidUserId: request.userId, topic: request.topic },
      user_id: request.userId,
    };
    const result = await sendDeliveryRow(row);
    return {
      ok: result.ok,
      dedupeKey: request.dedupeKey,
      status: result.skipped ? "duplicate" : result.ok ? "sent" : "failed",
      attempt: 1,
      error: result.error,
    };
  }

  async dispatchMany(requests: NotificationRequest[]): Promise<NotificationResult[]> {
    return Promise.all(requests.map((r) => this.dispatch(r)));
  }
}

let singleton: NotificationDispatcher | null = null;

export function getDispatcher(): NotificationDispatcher {
  if (!singleton) singleton = new DefaultNotificationDispatcher();
  return singleton;
}
