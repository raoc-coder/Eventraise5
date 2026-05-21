/**
 * Prints idempotent Vault SQL with your service_role filled in (for SQL Editor).
 * Does not connect to the database.
 */
import { execSync } from "child_process";

const PROJECT_REF = "yxzypekwyuopbanroobr";
const EDGE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/notify-outbid`;

function serviceRole(): string {
  const env = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (env) return env;
  const out = execSync(`supabase projects api-keys --project-ref ${PROJECT_REF} -o json`, {
    encoding: "utf8",
  });
  const keys = JSON.parse(out) as { name: string; api_key: string }[];
  const row = keys.find((k) => k.name === "service_role");
  if (!row?.api_key) throw new Error("Could not resolve service_role key");
  return row.api_key;
}

const jwt = serviceRole().replace(/'/g, "''");

console.log(`-- Paste into Supabase SQL Editor (project ${PROJECT_REF})\n`);
console.log(`DO $$
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
END $$;

SELECT name FROM vault.secrets
WHERE name IN ('notify_outbid_edge_url', 'notify_outbid_service_role');
`);
