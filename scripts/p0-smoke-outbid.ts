/**
 * P0 smoke: drain pending notification_deliveries + optional Edge invoke test.
 *
 *   npx tsx scripts/p0-smoke-outbid.ts
 *   npx tsx scripts/p0-smoke-outbid.ts --drain-only
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

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

async function main() {
  const env = loadEnv();
  const serviceRole =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    JSON.parse(
      execSync("supabase projects api-keys --project-ref yxzypekwyuopbanroobr -o json", {
        encoding: "utf8",
      }),
    ).find((k: { name: string }) => k.name === "service_role")?.api_key;

  if (!serviceRole) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

  const rawBase = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  let base = rawBase;
  try {
    const u = new URL(rawBase);
    if (u.hostname === "eventraisehub.com") {
      u.hostname = "www.eventraisehub.com";
      base = u.origin;
    }
  } catch {
    /* keep rawBase */
  }
  const cronSecret = env.CRON_SECRET;

  if (!process.argv.includes("--drain-only")) {
    const edgeUrl = "https://yxzypekwyuopbanroobr.supabase.co/functions/v1/notify-outbid";
    const res = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bid_id: "00000000-0000-0000-0000-000000000000",
        lot_id: "00000000-0000-0000-0000-000000000000",
      }),
    });
    const body = await res.text();
    console.log(`Edge smoke: HTTP ${res.status} ${body.slice(0, 120)}`);
    if (res.status === 401) process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL || "https://yxzypekwyuopbanroobr.supabase.co",
    serviceRole,
    { auth: { persistSession: false } },
  );

  const { data: pending, error } = await admin
    .from("notification_deliveries")
    .select("id, channel, status, dedupe_key, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Pending query failed:", error.message);
    process.exit(1);
  }

  console.log(`Pending deliveries (latest 10): ${pending?.length ?? 0}`);
  for (const row of pending ?? []) {
    console.log(`  - ${row.channel} ${row.dedupe_key?.slice(0, 40)}…`);
  }

  if (!cronSecret) {
    console.log("\nCRON_SECRET not set — skip drain. Add to .env.local and run:");
    console.log(`  curl -H "Authorization: Bearer <CRON_SECRET>" ${base}/api/cron/process-notification-deliveries`);
    return;
  }

  const cronRes = await fetch(`${base}/api/cron/process-notification-deliveries`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const cronBody = await cronRes.text();
  console.log(`\nCron drain (${base}): HTTP ${cronRes.status}`);
  console.log(cronBody);

  if (cronRes.status === 503 && base.includes("localhost")) {
    console.log("\nTip: start dev server with npm run dev, or set NEXT_PUBLIC_APP_URL to production.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
