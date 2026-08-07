/**
 * Shared PayPal capture settlement (Sprint 7).
 * Used by /api/paypal/capture-order and the PayPal webhook so donations /
 * tickets are credited exactly once.
 */
import { supabaseAdmin } from "@/lib/supabase";
import { captureAmountMatchesOrder } from "@/lib/money/fees";

export type SettleCaptureInput = {
  /** PayPal checkout order id (external). */
  orderId: string;
  captureId: string;
  /** Captured amount from PayPal (dollars), when available. */
  capturedAmount?: string | number | null;
  source: "capture-api" | "webhook";
};

export type SettleCaptureResult =
  | { ok: true; already: boolean; orderUuid: string }
  | { ok: false; error: string; status?: number };

type PaypalOrderRow = {
  id: string;
  order_id: string;
  event_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  status: string;
  type: string;
  ticket_id: string | null;
  quantity: number;
  capture_id: string | null;
  personal_campaign_id?: string | null;
};

export async function settlePaypalCapture(
  input: SettleCaptureInput,
): Promise<SettleCaptureResult> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Database unavailable", status: 500 };
  }

  const { data: order, error: lookupError } = await supabaseAdmin
    .from("paypal_orders")
    .select(
      "id, order_id, event_id, amount_cents, platform_fee_cents, net_amount_cents, status, type, ticket_id, quantity, capture_id, personal_campaign_id",
    )
    .eq("order_id", input.orderId)
    .maybeSingle();

  if (lookupError || !order) {
    // Retry without personal_campaign_id if column missing
    const { data: order2, error: err2 } = await supabaseAdmin
      .from("paypal_orders")
      .select(
        "id, order_id, event_id, amount_cents, platform_fee_cents, net_amount_cents, status, type, ticket_id, quantity, capture_id",
      )
      .eq("order_id", input.orderId)
      .maybeSingle();
    if (err2 || !order2) {
      return { ok: false, error: "Order not found", status: 404 };
    }
    return settleWithOrder(order2 as PaypalOrderRow, input);
  }

  return settleWithOrder(order as PaypalOrderRow, input);
}

async function settleWithOrder(
  order: PaypalOrderRow,
  input: SettleCaptureInput,
): Promise<SettleCaptureResult> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Database unavailable", status: 500 };
  }

  if (
    input.capturedAmount != null &&
    input.capturedAmount !== "" &&
    !captureAmountMatchesOrder(input.capturedAmount, order.amount_cents)
  ) {
    console.error("[settlePaypalCapture] amount mismatch", {
      orderId: input.orderId,
      expectedCents: order.amount_cents,
      capturedAmount: input.capturedAmount,
      source: input.source,
    });
    return { ok: false, error: "Capture amount does not match order", status: 409 };
  }

  // Idempotent: already settled with same capture
  if (
    (order.status === "captured" || order.status === "completed") &&
    order.capture_id &&
    order.capture_id === input.captureId
  ) {
    await ensureLedgerRows(order, input.captureId);
    return { ok: true, already: true, orderUuid: order.id };
  }

  if (order.status !== "pending" && order.status !== "captured") {
    return { ok: false, error: `Order is not capturable (${order.status})`, status: 409 };
  }

  // Conditional status flip (pending → captured only).
  if (order.status === "pending") {
    const { data: updated, error: upErr } = await supabaseAdmin
      .from("paypal_orders")
      .update({
        status: "captured",
        capture_id: input.captureId,
        captured_at: new Date().toISOString(),
      })
      .eq("order_id", input.orderId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (upErr) {
      console.error("[settlePaypalCapture] order update failed", upErr);
      return { ok: false, error: "Failed to update order", status: 500 };
    }

    // Race: another writer won — reload and treat as replay if same capture
    if (!updated) {
      const { data: again } = await supabaseAdmin
        .from("paypal_orders")
        .select("id, status, capture_id")
        .eq("order_id", input.orderId)
        .maybeSingle();
      if (again?.capture_id === input.captureId) {
        await ensureLedgerRows(order, input.captureId);
        return { ok: true, already: true, orderUuid: order.id };
      }
      return { ok: false, error: "Order capture race", status: 409 };
    }
  } else if (order.status === "captured" && !order.capture_id) {
    await supabaseAdmin
      .from("paypal_orders")
      .update({ capture_id: input.captureId })
      .eq("order_id", input.orderId);
  }

  await ensureLedgerRows(order, input.captureId);

  // Webhook may mark completed after capture-api already ran.
  if (input.source === "webhook") {
    await supabaseAdmin
      .from("paypal_orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("order_id", input.orderId)
      .in("status", ["captured", "completed"]);
  }

  return { ok: true, already: false, orderUuid: order.id };
}

async function ensureLedgerRows(order: PaypalOrderRow, captureId: string): Promise<void> {
  if (!supabaseAdmin) return;

  if (order.type === "donation") {
    const donationInsert: Record<string, unknown> = {
      event_id: order.event_id,
      amount_cents: order.amount_cents,
      fee_cents: order.platform_fee_cents,
      net_cents: order.net_amount_cents,
      status: "succeeded",
      donor_name: null,
      donor_email: null,
      settlement_status: "pending",
      paypal_order_id: order.id,
      paypal_capture_id: captureId,
    };
    if (order.personal_campaign_id) {
      donationInsert.personal_campaign_id = order.personal_campaign_id;
    }

    let { error } = await supabaseAdmin.from("donation_requests").insert(donationInsert);
    if (error && order.personal_campaign_id) {
      const msg = (error as { message?: string }).message ?? "";
      const code = (error as { code?: string }).code ?? "";
      if (code === "PGRST204" || code === "42703" || msg.includes("personal_campaign_id")) {
        delete donationInsert.personal_campaign_id;
        ;({ error } = await supabaseAdmin.from("donation_requests").insert(donationInsert));
      }
    }
    // Unique violation = already credited
    if (error && (error as { code?: string }).code !== "23505") {
      console.error("[settlePaypalCapture] donation insert", error);
    }
  }

  if (order.type === "ticket" && order.ticket_id) {
    const { error: regErr } = await supabaseAdmin.from("event_registrations").insert({
      event_id: order.event_id,
      type: "ticket",
      quantity: order.quantity,
      status: "confirmed",
      fee_cents: order.platform_fee_cents,
      net_cents: order.net_amount_cents,
      paypal_order_id: order.id,
      paypal_capture_id: captureId,
    });
    if (regErr && (regErr as { code?: string }).code !== "23505") {
      console.error("[settlePaypalCapture] registration insert", regErr);
    } else if (!regErr) {
      const { data: ok, error: invErr } = await supabaseAdmin.rpc("increment_event_ticket_sold", {
        p_ticket_id: order.ticket_id,
        p_qty: order.quantity,
      });
      if (invErr) {
        console.error("[settlePaypalCapture] ticket inventory", invErr);
      } else if (ok === false) {
        console.error("[settlePaypalCapture] ticket oversell blocked", {
          ticketId: order.ticket_id,
          qty: order.quantity,
        });
      }
    }
  }
}
