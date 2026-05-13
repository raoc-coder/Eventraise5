import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type Body = { bid_id?: string; lot_id?: string };

type Channel = "push" | "sms" | "email" | "in_app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!serviceRole || token !== serviceRole) {
    return json(401, { error: "unauthorized" });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const bidId = body.bid_id;
  const lotId = body.lot_id;
  if (!bidId || !lotId) {
    return json(400, { error: "missing_bid_or_lot" });
  }

  if ((Deno.env.get("NOTIFICATIONS_KILL_SWITCH") ?? "").toLowerCase() === "true") {
    return json(200, { ok: true, skipped: "kill_switch" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: bid, error: bidErr } = await supabase
    .from("bids")
    .select("id, lot_id, user_id, amount_cents")
    .eq("id", bidId)
    .maybeSingle();

  if (bidErr || !bid) {
    return json(404, { error: "bid_not_found", detail: bidErr?.message });
  }

  if (bid.lot_id !== lotId) {
    return json(400, { error: "lot_bid_mismatch" });
  }

  const { data: prevRows, error: prevErr } = await supabase
    .from("bids")
    .select("user_id")
    .eq("lot_id", lotId)
    .neq("id", bidId)
    .order("amount_cents", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  if (prevErr) {
    return json(500, {
      error: "previous_bid_lookup_failed",
      detail: prevErr.message,
    });
  }

  const outbidUserId = prevRows?.[0]?.user_id as string | undefined;
  if (!outbidUserId) {
    return json(200, { ok: true, skipped: "no_previous_bidder" });
  }

  if (outbidUserId === bid.user_id) {
    return json(200, { ok: true, skipped: "same_bidder" });
  }

  const { data: lot, error: lotErr } = await supabase
    .from("auction_lots")
    .select("id, title, auction_id, current_high_bid_cents")
    .eq("id", lotId)
    .maybeSingle();

  if (lotErr || !lot) {
    return json(404, { error: "lot_not_found", detail: lotErr?.message });
  }

  const { data: auction } = await supabase
    .from("auctions")
    .select("id, title, slug")
    .eq("id", lot.auction_id)
    .maybeSingle();

  const { data: prefRow } = await supabase
    .from("notification_preferences")
    .select("email_enabled, push_enabled, sms_enabled")
    .eq("user_id", outbidUserId)
    .maybeSingle();

  const emailEnabled = prefRow?.email_enabled ?? true;
  const pushEnabled = prefRow?.push_enabled ?? true;
  const smsEnabled = prefRow?.sms_enabled ?? false;

  const dedupeBase = `outbid:${lotId}:${outbidUserId}:${bidId}`;
  const payload = {
    topic: "outbid" as const,
    lotId,
    bidId,
    outbidUserId,
    newBidderId: bid.user_id,
    newAmountCents: bid.amount_cents,
    lotTitle: lot.title,
    auctionId: lot.auction_id,
    auctionTitle: auction?.title ?? null,
    auctionSlug: auction?.slug ?? null,
  };

  const rows: {
    dedupe_key: string;
    channel: Channel;
    status: string;
    payload: typeof payload;
  }[] = [];

  const add = (channel: Channel, enabled: boolean) => {
    if (!enabled) return;
    rows.push({
      dedupe_key: dedupeBase,
      channel,
      status: "pending",
      payload,
    });
  };

  add("push", pushEnabled);
  add("sms", smsEnabled);
  add("email", emailEnabled);
  add("in_app", true);

  let inserted = 0;
  for (const row of rows) {
    const { error } = await supabase.from("notification_deliveries").insert(row);
    if (!error) {
      inserted += 1;
    } else if (error.code === "23505") {
      /* unique (dedupe_key, channel) — idempotent replay */
    } else {
      console.error("delivery_insert_error", error);
      return json(500, {
        error: "delivery_enqueue_failed",
        detail: error.message,
      });
    }
  }

  return json(200, {
    ok: true,
    outbidUserId,
    dedupeKey: dedupeBase,
    channelsEnqueued: inserted,
  });
});

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
