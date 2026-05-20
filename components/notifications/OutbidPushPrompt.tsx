"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  dismissPushPrompt,
  pushPromptDismissed,
  registerPushSubscription,
} from "@/lib/notifications/push-browser";

type Props = {
  /** Show after a successful bid (S4.7). */
  show: boolean;
};

export function OutbidPushPrompt({ show }: Props) {
  const [hidden, setHidden] = useState(() => pushPromptDismissed());
  const [busy, setBusy] = useState(false);

  if (!show || hidden) return null;
  if (typeof window !== "undefined" && !("Notification" in window)) return null;

  async function enable() {
    setBusy(true);
    try {
      const result = await registerPushSubscription();
      if (result.ok) {
        toast.success("Outbid alerts enabled on this device.");
        dismissPushPrompt();
        setHidden(true);
      } else if (result.reason === "denied") {
        toast.error("Notifications blocked — enable them in browser settings.");
      } else if (result.reason === "unsupported") {
        toast.error("Push is not supported in this browser.");
      } else {
        toast.error("Could not enable alerts. Try again later.");
      }
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    dismissPushPrompt();
    setHidden(true);
  }

  return (
    <div
      className="mt-6 rounded-xl border border-action-200 bg-action-50/80 p-4"
      role="region"
      aria-label="Outbid notifications"
    >
      <div className="flex gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-action-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-trust-950">Get instant outbid alerts</p>
          <p className="mt-1 text-xs text-trust-700">
            Enable browser notifications so you know immediately when someone tops your bid.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void enable()}
              className="bg-action-600 hover:bg-action-700"
            >
              {busy ? "Enabling…" : "Enable alerts"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={skip} className="text-trust-700">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
