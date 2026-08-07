/**
 * PayPal Vault rehearsal — sandbox practice path + optional live PayPal API check.
 *
 *   npx tsx scripts/paypal-vault-rehearsal.ts           # practice vault E2E (DB + capture)
 *   npx tsx scripts/paypal-vault-rehearsal.ts --check   # PayPal OAuth + env only
 *   npx tsx scripts/paypal-vault-rehearsal.ts --seed    # open lot for browser test on Vercel (no auto-settle)
 *   npx tsx scripts/paypal-vault-rehearsal.ts --cleanup # remove rehearsal rows (tagged slug)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { settleClosedLot } from "../lib/auction/settle-lot";
import { createVaultSetupToken } from "../lib/auction/paypal-vault";

const REHEARSAL_SLUG = "ga-vault-rehearsal";
const REHEARSAL_EVENT_TITLE = "GA Vault Rehearsal";

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

/** lib/auction/paypal-vault reads process.env — sync .env.local before calling it. */
function applyEnv(env: Record<string, string>): void {
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value;
  }
}

function flag(name: string, env: Record<string, string>): boolean {
  return !!env[name]?.trim();
}

function appBase(env: Record<string, string>): string {
  let base = (env.NEXT_PUBLIC_APP_URL || "https://www.eventraisehub.com").replace(/\/$/, "");
  try {
    const u = new URL(base);
    if (u.hostname === "eventraisehub.com") u.hostname = "www.eventraisehub.com";
    return u.origin;
  } catch {
    return "https://www.eventraisehub.com";
  }
}

function printVercelBrowserSteps(env: Record<string, string>, auctionId: string, lotId: string): void {
  const base = appBase(env);
  const localSandbox = env.PAYPAL_ENVIRONMENT !== "production";
  const prodSite = base.includes("eventraisehub.com");
  const liveSmoke = prodSite && localSandbox;

  console.log(
    liveSmoke
      ? "\n--- LIVE smoke on www (Vercel=live PayPal; CLI=local sandbox) ---"
      : "\n--- Vercel browser test ---",
  );
  console.log(`  1. Sign in:     ${base}/auth/login`);
  if (liveSmoke) {
    console.log(`  2. Live vault:  ${base}/auctions/${auctionId}/register`);
    console.log(`      → Link PayPal (real personal account). Practice vault disabled on www.`);
  } else if (localSandbox) {
    console.log(`  2a. Practice:   ${base}/auctions/${auctionId}/register`);
    console.log(`      → Practice button when NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox on host`);
  } else {
    console.log(`  2. Vault:       ${base}/auctions/${auctionId}/register`);
  }
  console.log(`  3. Bid:         ${base}/auctions/${auctionId}/lots/${lotId}  (min $10.00)`);
  console.log(`  4. Close+sweep: npm run paypal:rehearsal -- --close-lot ${lotId}`);
  console.log(`      (closes lot in DB; capture runs on Vercel via prod cron + live PayPal)`);
  console.log(`  5. Verify:      paypal_capture_id in DB is NOT practice_capture`);
  console.log(`  Cleanup:        npm run paypal:rehearsal -- --cleanup`);
}

async function serviceRole(env: Record<string, string>): Promise<string> {
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (key) return key;
  const keys = JSON.parse(
    execSync("supabase projects api-keys --project-ref yxzypekwyuopbanroobr -o json", {
      encoding: "utf8",
    }),
  ) as { name: string; api_key: string }[];
  const found = keys.find((k) => k.name === "service_role")?.api_key;
  if (!found) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return found;
}

function adminClient(env: Record<string, string>, serviceRoleKey: string): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL || "https://yxzypekwyuopbanroobr.supabase.co",
    serviceRoleKey,
    { auth: { persistSession: false } },
  );
}

async function checkPayPal(env: Record<string, string>): Promise<{ ok: boolean; detail: string }> {
  const clientId = env.PAYPAL_CLIENT_ID || env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;
  const environment = env.PAYPAL_ENVIRONMENT === "production" ? "live" : "sandbox";
  const baseUrl =
    environment === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";

  if (!clientId?.trim() || !clientSecret?.trim()) {
    return { ok: false, detail: "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET missing in .env.local" };
  }

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, detail: `OAuth failed (${res.status}): ${text.slice(0, 160)}` };
  }

  const setup = await createVaultSetupToken(
    `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auctions/rehearsal/register?vault=return`,
    `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auctions/rehearsal/register?vault=cancel`,
  );
  if (!setup.ok) {
    return {
      ok: false,
      detail: `OAuth OK (${environment}) but vault setup-token failed: ${setup.error}`,
    };
  }

  return {
    ok: true,
    detail: `OAuth OK (${environment}); vault setup-token created (approve in browser for real vault)`,
  };
}

async function findRehearsalUser(admin: SupabaseClient): Promise<string> {
  const { data: pa } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("is_active", true)
    .not("user_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (pa?.user_id) return pa.user_id as string;

  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1 });
  const id = users?.users?.[0]?.id;
  if (!id) throw new Error("No auth users found — sign in once via /auth/register");
  return id;
}

async function cleanupRehearsal(admin: SupabaseClient): Promise<void> {
  const { data: auctions } = await admin.from("auctions").select("id, event_id").eq("slug", REHEARSAL_SLUG);
  const eventIds = new Set<string>();
  for (const a of auctions ?? []) {
    const auctionId = a.id as string;
    if (a.event_id) eventIds.add(a.event_id as string);
    const { data: lots } = await admin.from("auction_lots").select("id").eq("auction_id", auctionId);
    for (const lot of lots ?? []) {
      await admin.from("bids").delete().eq("lot_id", lot.id as string);
    }
    await admin.from("auction_lots").delete().eq("auction_id", auctionId);
    await admin.from("auction_registrations").delete().eq("auction_id", auctionId);
    await admin.from("auctions").delete().eq("id", auctionId);
  }
  for (const eventId of eventIds) {
    await admin.from("events").delete().eq("id", eventId);
  }
  console.log("Cleanup: removed rehearsal event/auction/lots (if any).");
}

async function seedRehearsalAuction(
  admin: SupabaseClient,
  userId: string,
): Promise<{ eventId: string; auctionId: string; lotId: string }> {
  await cleanupRehearsal(admin);

  const now = new Date();
  const closesAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const { data: event, error: evErr } = await admin
    .from("events")
    .insert({
      title: REHEARSAL_EVENT_TITLE,
      description: "Automated PayPal vault rehearsal — safe to delete",
      event_type: "auction",
      start_date: now.toISOString(),
      end_date: new Date(now.getTime() + 86400000).toISOString(),
      location: "Rehearsal",
      is_public: false,
      is_published: true,
      created_by: userId,
    })
    .select("id")
    .single();

  if (evErr || !event) throw new Error(`event insert failed: ${evErr?.message}`);

  const { data: auction, error: aErr } = await admin
    .from("auctions")
    .insert({
      event_id: event.id,
      title: "Vault Rehearsal Auction",
      slug: REHEARSAL_SLUG,
      currency: "usd",
      status: "published",
      mode: "silent",
      anti_snipe_enabled: false,
      created_by: userId,
    })
    .select("id")
    .single();

  if (aErr || !auction) throw new Error(`auction insert failed: ${aErr?.message}`);

  const { data: lot, error: lErr } = await admin
    .from("auction_lots")
    .insert({
      auction_id: auction.id,
      title: "Rehearsal Lot",
      description: "PayPal vault capture test — Vercel browser rehearsal",
      starting_bid_cents: 1000,
      min_increment_cents: 500,
      closes_at: closesAt,
      status: "open",
    })
    .select("id")
    .single();

  if (lErr || !lot) throw new Error(`lot insert failed: ${lErr?.message}`);

  return {
    eventId: event.id as string,
    auctionId: auction.id as string,
    lotId: lot.id as string,
  };
}

async function runSeedForVercel(
  admin: SupabaseClient,
  userId: string,
  env: Record<string, string>,
): Promise<void> {
  const { auctionId, lotId } = await seedRehearsalAuction(admin, userId);
  console.log("\n--- Seeded open lot for Vercel test ---");
  console.log(`  auction_id: ${auctionId}`);
  console.log(`  lot_id:     ${lotId}`);
  printVercelBrowserSteps(env, auctionId, lotId);
}

async function runPracticeRehearsal(
  admin: SupabaseClient,
  userId: string,
  env: Record<string, string>,
): Promise<void> {
  const { eventId, auctionId, lotId } = await seedRehearsalAuction(admin, userId);
  const auction = { id: auctionId };
  const lot = { id: lotId };
  const now = new Date();

  const { error: regErr } = await admin.from("auction_registrations").insert({
    auction_id: auction.id,
    user_id: userId,
    payment_method_token: "practice_vault",
    status: "active",
    client_idempotency_key: `rehearsal_${Date.now()}`,
  });
  if (regErr) throw new Error(`registration failed: ${regErr.message}`);

  const { data: bid, error: bidErr } = await admin
    .from("bids")
    .insert({
      lot_id: lot.id,
      user_id: userId,
      amount_cents: 1000,
      client_idempotency_key: `rehearsal_bid_${Date.now()}`,
    })
    .select("id")
    .single();
  if (bidErr || !bid) throw new Error(`bid insert failed: ${bidErr?.message}`);

  await admin
    .from("auction_lots")
    .update({ current_high_bid_cents: 1000 })
    .eq("id", lot.id);

  const past = new Date(now.getTime() - 60_000).toISOString();
  const { error: closeErr } = await admin
    .from("auction_lots")
    .update({
      status: "closed",
      winning_bid_id: bid.id,
      closes_at: past,
      updated_at: now.toISOString(),
    })
    .eq("id", lot.id);
  if (closeErr) throw new Error(`lot close failed: ${closeErr.message}`);

  const result = await settleClosedLot(admin, lot.id as string);
  console.log("Settlement:", result);

  const { data: settled } = await admin
    .from("auction_lots")
    .select("status, paypal_capture_id, paypal_order_id")
    .eq("id", lot.id)
    .single();

  const pass =
    result.outcome === "settled" &&
    settled?.status === "settled" &&
    settled?.paypal_capture_id === "practice_capture";

  console.log("\n--- Practice vault rehearsal ---");
  console.log(`  event_id:    ${eventId}`);
  console.log(`  auction_id:  ${auction.id}`);
  console.log(`  lot_id:      ${lot.id}`);
  console.log(`  bid_id:      ${bid.id}`);
  console.log(`  capture_id:  ${settled?.paypal_capture_id ?? "(none)"}`);
  console.log(`  result:      ${pass ? "PASS" : "FAIL"}`);

  if (!pass) {
    console.error("\nRehearsal failed — check settle-lot and auction_registrations.");
    process.exit(1);
  }

  printVercelBrowserSteps(env, auction.id as string, lot.id as string);
}

async function closeLotAndSweep(
  admin: SupabaseClient,
  env: Record<string, string>,
  lotId: string,
): Promise<void> {
  const { data: lot, error: lotErr } = await admin
    .from("auction_lots")
    .select("id, status, paypal_capture_id")
    .eq("id", lotId)
    .maybeSingle();
  if (lotErr || !lot) throw new Error(`lot not found: ${lotId}`);

  if (lot.paypal_capture_id || lot.status === "settled") {
    console.log(`Lot ${lotId} already settled (capture: ${lot.paypal_capture_id ?? "n/a"}) — sweep only`);
    await runSweep(env);
    return;
  }

  const { data: top } = await admin
    .from("bids")
    .select("id")
    .eq("lot_id", lotId)
    .order("amount_cents", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!top?.id) throw new Error("no bids on lot — place a bid on Vercel first");

  const past = new Date(Date.now() - 60_000).toISOString();
  await admin
    .from("auction_lots")
    .update({
      status: "closed",
      winning_bid_id: top.id,
      closes_at: past,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lotId)
    .eq("status", "open");

  await runSweep(env);
}

async function runSweep(env: Record<string, string>): Promise<void> {
  const cronSecret = env.CRON_SECRET?.trim();
  if (!cronSecret) throw new Error("CRON_SECRET missing");

  const base = appBase(env);

  const res = await fetch(`${base}/api/cron/sweep-auction-lots`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.text();
  console.log(`Sweep cron (${base}): HTTP ${res.status}`);
  console.log(body.slice(0, 800));
  if (res.status !== 200) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const env = loadEnv();
  applyEnv(env);
  const sr = await serviceRole(env);
  const admin = adminClient(env, sr);

  console.log("=== PayPal Vault rehearsal ===\n");
  console.log("Environment:");
  console.log(`  PAYPAL_CLIENT_ID          ${flag("PAYPAL_CLIENT_ID", env) || flag("NEXT_PUBLIC_PAYPAL_CLIENT_ID", env) ? "set" : "missing"}`);
  console.log(`  PAYPAL_CLIENT_SECRET      ${flag("PAYPAL_CLIENT_SECRET", env) ? "set" : "missing"}`);
  console.log(`  PAYPAL_ENVIRONMENT        ${env.PAYPAL_ENVIRONMENT || "sandbox (default)"}`);
  console.log(`  CRON_SECRET               ${flag("CRON_SECRET", env) ? "set" : "missing"}`);

  if (args.includes("--cleanup")) {
    await cleanupRehearsal(admin);
    return;
  }

  if (args.includes("--check") || args.includes("--check-only")) {
    const pp = await checkPayPal(env);
    console.log(`\nPayPal API: ${pp.ok ? "OK" : "SKIP/FAIL"} — ${pp.detail}`);
    process.exit(pp.ok ? 0 : 1);
  }

  if (args.includes("--sweep")) {
    await runSweep(env);
    return;
  }

  const closeIdx = args.indexOf("--close-lot");
  if (closeIdx >= 0) {
    const lotId = args[closeIdx + 1];
    if (!lotId) throw new Error("Usage: --close-lot <lot-uuid>");
    await closeLotAndSweep(admin, env, lotId);
    return;
  }

  if (args.includes("--seed")) {
    const userId = await findRehearsalUser(admin);
    await runSeedForVercel(admin, userId, env);
    return;
  }

  const pp = await checkPayPal(env);
  console.log(`\nPayPal API: ${pp.ok ? "OK" : "not configured"} — ${pp.detail}`);

  const userId = await findRehearsalUser(admin);
  console.log(`\nRehearsal user: ${userId}`);

  await runPracticeRehearsal(admin, userId, env);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
