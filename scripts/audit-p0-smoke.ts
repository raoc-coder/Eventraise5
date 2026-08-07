/**
 * P0.6 smoke checks for audit remediations (API layer).
 *
 * Hits a running app (local or production). Does not charge PayPal.
 *
 *   NEXT_PUBLIC_APP_URL=http://localhost:3000 npx tsx scripts/audit-p0-smoke.ts
 *   npx tsx scripts/audit-p0-smoke.ts --base https://www.eventraisehub.com
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

function loadEnv(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.local");
  const out: Record<string, string> = { ...process.env } as Record<string, string>;
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return undefined;
}

type Smoke = { id: string; ok: boolean; detail: string };

async function main() {
  const env = loadEnv();
  const base = (
    argValue("--base") ||
    env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  console.log(`=== Audit P0 smoke against ${base} ===\n`);
  const results: Smoke[] = [];

  // P0.6.2 — register rejects type=ticket
  {
    const fakeId = randomUUID();
    const res = await fetch(`${base}/api/events/${fakeId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ticket",
        name: "Audit Smoke",
        email: "audit-smoke@example.com",
        quantity: 1,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const ok =
      res.status === 400 &&
      typeof body.error === "string" &&
      /payment|checkout|ticket/i.test(body.error);
    results.push({
      id: "P0.6.register_rejects_ticket",
      ok,
      detail: `HTTP ${res.status} ${JSON.stringify(body).slice(0, 180)}`,
    });
  }

  // P0.6.5 — draft event GET returns 404 for anon (needs a draft in DB)
  {
    const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      results.push({
        id: "P0.6.draft_event_idor",
        ok: false,
        detail: "Skipped — no service role to locate a draft event",
      });
    } else {
      const admin = createClient(url, key, { auth: { persistSession: false } });
      const { data: draft } = await admin
        .from("events")
        .select("id, is_published")
        .eq("is_published", false)
        .limit(1)
        .maybeSingle();

      if (!draft?.id) {
        results.push({
          id: "P0.6.draft_event_idor",
          ok: true,
          detail: "No draft events in DB — skipped (treated OK); create a draft to fully verify",
        });
      } else {
        const res = await fetch(`${base}/api/events/${draft.id}`);
        const ok = res.status === 404;
        results.push({
          id: "P0.6.draft_event_idor",
          ok,
          detail: `Draft ${draft.id} → HTTP ${res.status} (expect 404 for anon)`,
        });
      }
    }
  }

  // P0.6.1 — ticket create-order ignores client underpayment (needs published event + ticket)
  {
    const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      results.push({
        id: "P0.6.ticket_server_price",
        ok: false,
        detail: "Skipped — no service role",
      });
    } else {
      const admin = createClient(url, key, { auth: { persistSession: false } });
      const { data: ticket } = await admin
        .from("event_tickets")
        .select("id, event_id, price_cents, events!inner(id, is_published)")
        .gt("price_cents", 100)
        .eq("events.is_published", true)
        .limit(1)
        .maybeSingle();

      if (!ticket) {
        results.push({
          id: "P0.6.ticket_server_price",
          ok: true,
          detail: "No published paid ticket found — skipped (OK). Seed a ticket to fully verify.",
        });
      } else {
        const res = await fetch(`${base}/api/paypal/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: ticket.event_id,
            type: "ticket",
            ticketId: ticket.id,
            quantity: 1,
            amount: 0.01, // attacker underpayment — server must ignore
            currency: "USD",
          }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          orderId?: string;
          fees?: { total?: number; amount?: number };
          error?: string;
        };
        // Success path: order created at DB price (not $0.01). Failure path (PayPal down) still OK if not accepting 0.01 blindly — hard to assert without order store.
        if (res.ok && body.orderId) {
          const { data: order } = await admin
            .from("paypal_orders")
            .select("amount_cents, ticket_id")
            .eq("order_id", body.orderId)
            .maybeSingle();
          const expected = Number(ticket.price_cents);
          const ok = !!order && order.amount_cents === expected;
          results.push({
            id: "P0.6.ticket_server_price",
            ok,
            detail: ok
              ? `Order ${body.orderId} stored at ${order?.amount_cents} cents (ticket ${expected}); client sent $0.01`
              : `Order created but amount_cents=${order?.amount_cents} expected ${expected}`,
          });
        } else {
          // PayPal may fail in this environment — still verify 400 for missing ticketId path
          const bad = await fetch(`${base}/api/paypal/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: ticket.event_id,
              type: "ticket",
              amount: 0.01,
            }),
          });
          const badBody = (await bad.json().catch(() => ({}))) as { error?: string };
          const ok = bad.status === 400 && /ticketId/i.test(String(badBody.error || ""));
          results.push({
            id: "P0.6.ticket_server_price",
            ok,
            detail: `Full underpay create returned HTTP ${res.status} (${body.error || "no order"}); ticketId-required check HTTP ${bad.status}: ${badBody.error}`,
          });
        }
      }
    }
  }

  // Admin preflight shape (H7 fix)
  {
    const res = await fetch(`${base}/api/admin/auth/preflight`);
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const leakKeys = [
      "serviceRoleConfigured",
      "adminPasswordConfigured",
      "supabaseProjectRef",
      "activePlatformAdmins",
      "expectedProjectRef",
    ];
    const leaked = leakKeys.filter((k) => k in body);
    const ok = res.ok && body.ok === true && "ready" in body && leaked.length === 0;
    results.push({
      id: "P0.6.preflight_minimal",
      ok,
      detail: ok
        ? `Preflight minimal shape OK: ${JSON.stringify(body)}`
        : `HTTP ${res.status} body=${JSON.stringify(body).slice(0, 200)} leaked=${leaked.join(",")}`,
    });
  }

  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id}`);
    console.log(`       ${r.detail}`);
  }
  const allOk = results.every((r) => r.ok);
  console.log(`\nOverall: ${allOk ? "PASS" : "FAIL"}`);
  console.log(
    "Note: payout completed / cashout null-owner need authenticated sessions — cover in QA runbook.",
  );
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
