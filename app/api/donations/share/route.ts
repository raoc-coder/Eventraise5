import { NextRequest, NextResponse } from "next/server";
import { normalizePhoneE164 } from "@/lib/phone";
import { sendSms } from "@/lib/twilio-sms";
import { rateLimit, getClientKeyFromHeaders } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Max custom message length to limit SMS cost / abuse. */
const MAX_MESSAGE_LEN = 160;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const key = getClientKeyFromHeaders(req.headers);
    if (!(await rateLimit(`donations-share:${key}`, 5))) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { phone, eventId, message } = body || {};
    if (!phone || !eventId) {
      return NextResponse.json({ ok: false, error: "Missing phone or eventId" }, { status: 400 });
    }

    const e164 = normalizePhoneE164(String(phone));
    if (!e164) {
      return NextResponse.json({ ok: false, error: "Invalid phone number" }, { status: 400 });
    }

    // Verify event exists and is published before sending SMS (cost control).
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Service unavailable" }, { status: 503 });
    }
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, is_published")
      .eq("id", String(eventId))
      .maybeSingle();

    if (eventError || !event || event.is_published === false) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const eventUrl = `${appUrl}/events/${encodeURIComponent(String(eventId))}`;
    // Strip control chars; cap length — custom text is optional branding only.
    const rawMessage = typeof message === "string" ? message.replace(/[\r\n\t]+/g, " ").trim() : "";
    const safeMessage = rawMessage.slice(0, MAX_MESSAGE_LEN);
    const prefix = safeMessage ? `${safeMessage}\n\n` : "";
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
