import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

type PushKeys = { p256dh?: string; auth?: string };
type PushSubscriptionJson = {
  endpoint?: string;
  keys?: PushKeys;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, db } = await requireAuth(req);
    const body = (await req.json().catch(() => null)) as {
      subscription?: PushSubscriptionJson;
    } | null;

    const sub = body?.subscription;
    const endpoint = sub?.endpoint?.trim();
    const keys_p256dh = sub?.keys?.p256dh?.trim();
    const keys_auth = sub?.keys?.auth?.trim();

    if (!endpoint || !keys_p256dh || !keys_auth) {
      return NextResponse.json({ ok: false, error: "invalid_subscription" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;

    const { error } = await db.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint,
        keys_p256dh,
        keys_auth,
        user_agent: ua,
      },
      { onConflict: "user_id,endpoint" },
    );

    if (error) {
      console.error("[push-subscribe]", error);
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }

    await db.from("notification_preferences").upsert(
      {
        user_id: user.id,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unauthorized";
    if (msg === "Authentication required") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    console.error("[push-subscribe]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
