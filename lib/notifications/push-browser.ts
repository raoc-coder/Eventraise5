const SW_PATH = "/sw.js";
const PROMPT_DISMISSED_KEY = "eventraise_push_prompt_dismissed";

export function pushPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPushPrompt(): void {
  try {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
  } catch {
    /* ignore */
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerPushSubscription(): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!vapidPublic) return { ok: false, reason: "vapid_not_configured" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const reg = await navigator.serviceWorker.register(SW_PATH);
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const appServerKey = urlBase64ToUint8Array(vapidPublic);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey.buffer.slice(
        appServerKey.byteOffset,
        appServerKey.byteOffset + appServerKey.byteLength,
      ) as ArrayBuffer,
    });
  }

  const json = sub.toJSON();
  const res = await fetch("/api/notifications/push-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ subscription: json }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, reason: (body as { error?: string }).error || "save_failed" };
  }

  return { ok: true };
}
