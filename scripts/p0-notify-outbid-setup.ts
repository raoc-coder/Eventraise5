/**
 * P0 setup: Vault secrets for notify-outbid pg_net trigger (ADR-0008).
 *
 * Prerequisites:
 *   - Linked project: supabase link --project-ref yxzypekwyuopbanroobr
 *   - Edge deployed: supabase functions deploy notify-outbid
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (or pass via env)
 *
 * Usage:
 *   npx tsx scripts/p0-notify-outbid-setup.ts
 *   npx tsx scripts/p0-notify-outbid-setup.ts --verify-only
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const PROJECT_REF = "yxzypekwyuopbanroobr";
const EDGE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/notify-outbid`;

function loadEnvLocal(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function serviceRoleFromCli(): string | null {
  try {
    const out = execSync(
      `supabase projects api-keys --project-ref ${PROJECT_REF}`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
    const lines = out.split("\n");
    for (const line of lines) {
      if (line.includes("service_role")) {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length >= 3 && parts[1] === "service_role") {
          return parts[2];
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const env = { ...loadEnvLocal(), ...process.env };
  let serviceRole =
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() || serviceRoleFromCli() || null;

  if (!serviceRole) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add to .env.local or run: supabase projects api-keys --project-ref",
      PROJECT_REF,
    );
    process.exit(1);
  }

  const dbUrl = env.DATABASE_URL?.trim() || env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) {
    console.log("\n--- Vault SQL (run in Supabase Dashboard → SQL Editor) ---\n");
    console.log(
      `-- Replace SERVICE_ROLE_JWT with your service role key (never commit this file with real JWT)\n` +
        `select vault.create_secret('${EDGE_URL}', 'notify_outbid_edge_url', 'notify-outbid Edge URL');\n` +
        `select vault.create_secret('SERVICE_ROLE_JWT', 'notify_outbid_service_role', 'Bearer for Edge invoke');\n`,
    );
    console.log("\nOr set DATABASE_URL (Session pooler) and re-run this script.\n");
    if (verifyOnly) process.exit(0);
    process.exit(0);
  }

  // Dynamic import pg only when DATABASE_URL is set
  const { Client } = await import("pg");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const { rows: existing } = await client.query<{ name: string }>(
      `SELECT name FROM vault.secrets WHERE name = ANY($1::text[])`,
      [["notify_outbid_edge_url", "notify_outbid_service_role"]],
    );
    const names = new Set(existing.map((r) => r.name));

    if (!verifyOnly) {
      if (!names.has("notify_outbid_edge_url")) {
        await client.query(`SELECT vault.create_secret($1, 'notify_outbid_edge_url', $2)`, [
          EDGE_URL,
          "notify-outbid Edge URL",
        ]);
        console.log("Created vault secret: notify_outbid_edge_url");
      } else {
        console.log("Vault secret already exists: notify_outbid_edge_url");
      }

      if (!names.has("notify_outbid_service_role")) {
        await client.query(`SELECT vault.create_secret($1, 'notify_outbid_service_role', $2)`, [
          serviceRole,
          "Service role JWT for Edge",
        ]);
        console.log("Created vault secret: notify_outbid_service_role");
      } else {
        console.log("Vault secret already exists: notify_outbid_service_role");
      }
    }

    const { rows: ext } = await client.query(
      `SELECT extname FROM pg_extension WHERE extname IN ('pg_net', 'vault')`,
    );
    console.log("Extensions:", ext.map((r: { extname: string }) => r.extname).join(", ") || "none");

    const { rows: trig } = await client.query(
      `SELECT tgname FROM pg_trigger WHERE tgname = 'bids_notify_outbid_enqueue'`,
    );
    console.log("Trigger bids_notify_outbid_enqueue:", trig.length ? "present" : "MISSING");

    const { rows: secrets } = await client.query(
      `SELECT name FROM vault.secrets WHERE name = ANY($1::text[])`,
      [["notify_outbid_edge_url", "notify_outbid_service_role"]],
    );
    console.log(
      "Vault secrets:",
      secrets.map((r: { name: string }) => r.name).join(", ") || "none",
    );
  } finally {
    await client.end();
  }

  // Direct Edge smoke (no bid required)
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bid_id: "00000000-0000-0000-0000-000000000000", lot_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const body = await res.text();
  console.log(`Edge POST smoke: HTTP ${res.status} (expect 404 bid_not_found if auth OK)`);
  if (res.status === 401) {
    console.error("Edge returned 401 — check service role and function deploy.");
    process.exit(1);
  }
  if (res.status !== 404 && res.status !== 400) {
    console.log("Body:", body.slice(0, 200));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
