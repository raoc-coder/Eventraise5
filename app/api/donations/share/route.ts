import { NextRequest, NextResponse } from "next/server";
import { normalizePhoneE164 } from "@/lib/phone";
import { sendSms } from "@/lib/twilio-sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { phone, eventId, message } = body || {};
    if (!phone || !eventId) {
      return NextResponse.json({ ok: false, error: "Missing phone or eventId" }, { status: 400 });
    }

    const e164 = normalizePhoneE164(String(phone));
    if (!e164) {
      return NextResponse.json({ ok: false, error: "Invalid phone number" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const eventUrl = `${appUrl}/events/${encodeURIComponent(String(eventId))}`;
    const prefix = typeof message === "string" && message.trim() ? `${message.trim()}\n\n` : "";
    const text = `${prefix}Support this event on EventraiseHub: ${eventUrl}`;

    const sent = await sendSms(e164, text);
    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "SMS not configured or delivery failed" },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
