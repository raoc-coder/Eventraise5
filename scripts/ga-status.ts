/**
 * Phase GA readiness snapshot (no secrets printed).
 *
 *   npx tsx scripts/ga-status.ts
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

function flag(name: string, env: Record<string, string>): string {
  const v = env[name]?.trim();
  return v ? "set" : "missing";
}

/** Apex redirects to www; use www for cron/API probes so Bearer auth is not lost. */
function canonicalAppBase(url: string | undefined): string {
  const raw = (url || "https://www.eventraisehub.com").replace(/\/$/, "");
  try {
    const u = new URL(raw);
    if (u.hostname === "eventraisehub.com") {
      u.hostname = "www.eventraisehub.com";
      return u.origin;
    }
    return u.origin;
  } catch {
    return "https://www.eventraisehub.com";
  }
}

async function main() {
  const env = loadEnv();
  const configuredUrl = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const base = canonicalAppBase(configuredUrl);
  const cronSecret = env.CRON_SECRET?.trim();

  console.log("=== Phase GA — readiness snapshot ===\n");
  console.log("Environment (.env.local):");
  console.log(`  NEXT_PUBLIC_SUPABASE_URL     ${flag("NEXT_PUBLIC_SUPABASE_URL", env)}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY    ${flag("SUPABASE_SERVICE_ROLE_KEY", env)}`);
  console.log(`  CRON_SECRET                  ${flag("CRON_SECRET", env)}`);
  console.log(`  VAPID_PRIVATE_KEY            ${flag("VAPID_PRIVATE_KEY", env)}`);
  console.log(`  NEXT_PUBLIC_VAPID_PUBLIC_KEY ${flag("NEXT_PUBLIC_VAPID_PUBLIC_KEY", env)}`);
  console.log(`  PLATFORM_ADMIN_PASSWORD      ${flag("PLATFORM_ADMIN_PASSWORD", env)}`);
  console.log(`  TWILIO_MESSAGING_SERVICE_SID ${flag("TWILIO_MESSAGING_SERVICE_SID", env)}`);
  console.log(`  PAYPAL_CLIENT_ID             ${flag("PAYPAL_CLIENT_ID", env) || flag("NEXT_PUBLIC_PAYPAL_CLIENT_ID", env) ? "set" : "missing"}`);
  console.log(`  PAYPAL_ENVIRONMENT           ${env.PAYPAL_ENVIRONMENT || "sandbox (default)"}`);
  console.log(`  NEXT_PUBLIC_PAYPAL_ENVIRONMENT ${env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || "sandbox (default)"}`);
  console.log(`  NEXT_PUBLIC_APP_URL          ${configuredUrl || "(default)"}`);
  if (configuredUrl && canonicalAppBase(configuredUrl) !== configuredUrl) {
    console.log(`  (cron probe uses www)        ${base}`);
  }

  // Sprint 8 — CORS / app URL safety
  try {
    const { validateAppUrl } = await import("../lib/config/app-url");
    const cors = validateAppUrl(configuredUrl);
    console.log(
      `  CORS app URL                 ${cors.ok ? `PASS (${cors.origin})` : `FAIL (${cors.error})`}`,
    );
  } catch (e) {
    console.log(`  CORS app URL                 error: ${e instanceof Error ? e.message : e}`);
  }

  let serviceRole: string | undefined = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
  if (!serviceRole) {
    try {
      const keys = JSON.parse(
        execSync("supabase projects api-keys --project-ref yxzypekwyuopbanroobr -o json", {
          encoding: "utf8",
        }),
      ) as { name: string; api_key: string }[];
      serviceRole = keys.find((k) => k.name === "service_role")?.api_key;
    } catch {
      /* ignore */
    }
  }

  if (serviceRole) {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL || "https://yxzypekwyuopbanroobr.supabase.co",
      serviceRole,
      { auth: { persistSession: false } },
    );

    const tables = [
      ["auctions", "auctions"],
      ["auction_lots (open)", "auction_lots", "status", "open"],
      ["bids", "bids"],
      ["notification_deliveries (pending)", "notification_deliveries", "status", "pending"],
      ["platform_admins (active)", "platform_admins", "is_active", true],
    ] as const;

    console.log("\nDatabase (linked project):");
    for (const row of tables) {
      const [, table, col, val] = row;
      let q = admin.from(table).select("id", { count: "exact", head: true });
      if (col !== undefined) q = q.eq(col, val as string | boolean);
      const { count, error } = await q;
      console.log(`  ${row[0].padEnd(36)} ${error ? `error: ${error.message}` : (count ?? 0)}`);
    }
  } else {
    console.log("\nDatabase: skipped (no service role key)");
  }

  if (cronSecret) {
    const cronRes = await fetch(`${base}/api/cron/process-notification-deliveries`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const label =
      cronRes.status === 200
        ? "OK"
        : cronRes.status === 401
          ? "FAIL — CRON_SECRET mismatch or redeploy needed (probe uses www host)"
          : `HTTP ${cronRes.status}`;
    console.log(`\nProduction cron drain (${base}): ${label}`);
    if (cronRes.status === 200 && configuredUrl?.includes("://eventraisehub.com")) {
      console.log(
        "  Tip: align .env.local to https://www.eventraisehub.com (Vercel prod is already www).",
      );
    }
  } else {
    console.log("\nProduction cron drain: skipped (CRON_SECRET missing locally)");
  }

  console.log("\nNext actions:");
  console.log("  1. Vercel: PLATFORM_ADMIN_PASSWORD (match .env.local) if not set");
  console.log("  2. npm run p0:smoke — after a real bid exists");
  console.log("  3. PayPal vault: docs/runbooks/paypal-vault-rehearsal.md");
  console.log("  4. Walk docs/adrs/operational-readiness.md §5 then §6");
  console.log("  See docs/phase-ga-go-live.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
