import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/twilio-sms";
import {
  outbidPushCopy,
  outbidSmsCopy,
  parseOutbidPayload,
  type OutbidPayload,
} from "@/lib/notifications/outbid-payload";
import type { NotificationChannel } from "@/lib/notifications/dispatcher";

export type DeliveryRow = {
  id: string;
  dedupe_key: string;
  channel: string;
  status: string;
  payload: unknown;
  user_id: string | null;
};

function vapidConfigured(): boolean {
  return !!(
    process.env.VAPID_SUBJECT &&
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  );
}

async function resolveUserId(row: DeliveryRow): Promise<string | null> {
  if (row.user_id) return row.user_id;
  const p = parseOutbidPayload(row.payload);
  return p?.outbidUserId ?? null;
}

async function sendPush(userId: string, payload: OutbidPayload): Promise<{ ok: boolean; error?: string }> {
  if (!vapidConfigured() || !supabaseAdmin) {
    return { ok: false, error: "vapid_not_configured" };
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, keys_p256dh, keys_auth")
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  if (!subs?.length) return { ok: false, error: "no_push_subscription" };

  const copy = outbidPushCopy(payload);
  const pushPayload = JSON.stringify({
    title: copy.title,
    body: copy.body,
    url: copy.url,
    topic: "outbid",
  });

  let sent = 0;
  let lastError: string | undefined;
  for (const sub of subs) {
    if (!sub.keys_p256dh || !sub.keys_auth) continue;
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        pushPayload,
      );
      sent += 1;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "push_failed";
    }
  }

  return sent > 0 ? { ok: true } : { ok: false, error: lastError || "push_failed" };
}

async function sendSmsToUser(userId: string, payload: OutbidPayload): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) return { ok: false, error: "no_db" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .maybeSingle();

  let phone = profile?.phone?.trim();
  if (!phone) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    phone = authUser?.user?.phone?.trim();
  }
  if (!phone) return { ok: false, error: "no_phone" };

  const body = outbidSmsCopy(payload);
  const ok = await sendSms(phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`, body);
  return ok ? { ok: true } : { ok: false, error: "sms_send_failed" };
}

async function sendInApp(userId: string, payload: OutbidPayload): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) return { ok: false, error: "no_db" };
  const copy = outbidPushCopy(payload);
  const { error } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: copy.title,
    message: copy.body,
    type: "outbid",
    is_read: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendDeliveryRow(row: DeliveryRow): Promise<{
  ok: boolean;
  error?: string;
  skipped?: string;
}> {
  const userId = await resolveUserId(row);
  if (!userId) return { ok: false, error: "missing_user_id" };

  const payload = parseOutbidPayload(row.payload);
  if (!payload) return { ok: false, error: "invalid_payload" };

  const channel = row.channel as NotificationChannel;

  if (channel === "email") {
    return { ok: true, skipped: "email_channel_removed" };
  }

  if (channel === "push") return sendPush(userId, payload);
  if (channel === "sms") return sendSmsToUser(userId, payload);
  if (channel === "in_app") return sendInApp(userId, payload);

  return { ok: false, error: "unknown_channel" };
}

export async function processPendingDeliveries(limit = 50): Promise<{
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  if (!supabaseAdmin) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0 };
  }

  const { data: rows, error } = await supabaseAdmin
    .from("notification_deliveries")
    .select("id, dedupe_key, channel, status, payload, user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !rows?.length) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0 };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await sendDeliveryRow(row as DeliveryRow);
    const now = new Date().toISOString();
    const nextStatus = result.ok
      ? result.skipped
        ? "skipped"
        : "sent"
      : "failed";

    await supabaseAdmin
      .from("notification_deliveries")
      .update({
        status: nextStatus,
        error: result.error ?? null,
        sent_at: result.ok && !result.skipped ? now : null,
        user_id: row.user_id ?? (parseOutbidPayload(row.payload)?.outbidUserId ?? null),
      })
      .eq("id", row.id);

    if (result.skipped) skipped += 1;
    else if (result.ok) sent += 1;
    else failed += 1;
  }

  return { processed: rows.length, sent, failed, skipped };
}
