/**
 * Apply migration 033_security_hardening.sql via Supabase Management API.
 *
 * Requires: `supabase login` OR SUPABASE_ACCESS_TOKEN
 *
 *   npx tsx scripts/audit-p0-apply-033.ts
 *   npx tsx scripts/audit-p0-apply-033.ts --dry-run
 */
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { homedir } from "os";

const PROJECT_REF = "yxzypekwyuopbanroobr";
const MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/033_security_hardening.sql",
);

function accessToken(): string {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  const p = join(homedir(), ".supabase", "access-token");
  if (!existsSync(p)) {
    throw new Error(
      "Missing Supabase access token. Run: npx supabase login\n" +
        "Or set SUPABASE_ACCESS_TOKEN in the environment.",
    );
  }
  return readFileSync(p, "utf8").trim();
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
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!existsSync(MIGRATION_PATH)) {
    throw new Error(`Migration file not found: ${MIGRATION_PATH}`);
  }
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`File:    ${MIGRATION_PATH} (${sql.length} bytes)`);

  if (dryRun) {
    console.log("\n--dry-run: not applying. First 400 chars:\n");
    console.log(sql.slice(0, 400) + "…");
    return;
  }

  const token = accessToken();
  console.log("Applying migration 033…");
  await runQuery(token, sql);
  console.log("Apply request succeeded.");

  const triggers = await runQuery(
    token,
    `
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND t.tgname IN (
        'trg_prevent_profile_role_self_escalation',
        'trg_protect_personal_campaign_totals'
      )
      AND NOT t.tgisinternal
    ORDER BY 1;
    `,
  );
  console.log("Triggers:", JSON.stringify(triggers, null, 2));

  const policies = await runQuery(
    token,
    `
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname IN (
        'paypal_orders_insert_deny_clients',
        'donations_insert_deny_clients',
        'donations_update_deny_clients'
      )
    ORDER BY 1, 2;
    `,
  );
  console.log("Policies:", JSON.stringify(policies, null, 2));
  console.log("\nDone. Re-run: npm run audit:p0:status");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
