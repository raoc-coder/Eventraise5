import { NextRequest, NextResponse } from "next/server";
import { processPendingDeliveries } from "@/lib/notifications/send-delivery";

export const dynamic = "force-dynamic";

/**
 * Drains `notification_deliveries` where status = pending (S4.6).
 * Schedule via Vercel cron; also callable with CRON_SECRET for manual runs.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cron_not_configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await processPendingDeliveries(50);
  return NextResponse.json({ ok: true, ...result });
}
