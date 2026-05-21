/**
 * Applies Vault secrets for notify-outbid via Supabase Management API.
 * Requires: `supabase login` (access token at ~/.supabase/access-token)
 */
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { execSync } from "child_process";

const PROJECT_REF = "yxzypekwyuopbanroobr";
const EDGE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/notify-outbid`;

function accessToken(): string {
  const p = join(homedir(), ".supabase", "access-token");
  if (!existsSync(p)) throw new Error("Run: supabase login");
  return readFileSync(p, "utf8").trim();
}

function serviceRole(): string {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  }
  const out = execSync(`supabase projects api-keys --project-ref ${PROJECT_REF} -o json`, {
    encoding: "utf8",
  });
  const keys = JSON.parse(out) as { name: string; api_key: string }[];
  const row = keys.find((k) => k.name === "service_role");
  if (!row?.api_key) throw new Error("service_role key not found");
  return row.api_key;
}

async function runQuery(token: string, query: string): Promise<unknown> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Query failed HTTP ${res.status}: ${text}`);
  }
  return JSON.parse(text) as unknown;
}

async function main() {
  const token = accessToken();
  const jwt = serviceRole().replace(/'/g, "''");

  const setupSql = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'notify_outbid_edge_url') THEN
    PERFORM vault.create_secret(
      '${EDGE_URL}',
      'notify_outbid_edge_url',
      'notify-outbid Edge URL'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'notify_outbid_service_role') THEN
    PERFORM vault.create_secret(
      '${jwt}',
      'notify_outbid_service_role',
      'Bearer token for Edge invoke'
    );
  END IF;
END $$;`;

  console.log("Applying Vault secrets…");
  await runQuery(token, setupSql);

  const verify = await runQuery(
    token,
    `SELECT name FROM vault.secrets WHERE name IN ('notify_outbid_edge_url', 'notify_outbid_service_role');`,
  );
  console.log("Vault secrets:", JSON.stringify(verify, null, 2));

  const trig = await runQuery(
    token,
    `SELECT tgname FROM pg_trigger WHERE tgname = 'bids_notify_outbid_enqueue';`,
  );
  console.log("Trigger:", JSON.stringify(trig, null, 2));

  const ext = await runQuery(
    token,
    `SELECT extname FROM pg_extension WHERE extname = 'pg_net';`,
  );
  console.log("pg_net:", JSON.stringify(ext, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
