/**
 * Apply migration 034_money_path_integrity.sql via Supabase Management API.
 *
 * Requires: `supabase login` OR SUPABASE_ACCESS_TOKEN
 *
 *   npm run audit:migrate:034
 *   npm run audit:migrate:034 -- --dry-run
 */
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { homedir } from "os";

const PROJECT_REF = "yxzypekwyuopbanroobr";
const MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/034_money_path_integrity.sql",
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
  console.log("Applying migration 034…");
  await runQuery(token, sql);
  console.log("Apply request succeeded.");

  const indexes = await runQuery(
    token,
    `
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (
        'uq_donation_requests_paypal_capture_id',
        'uq_event_registrations_paypal_capture_id'
      )
    ORDER BY 1;
    `,
  );
  console.log("Indexes:", JSON.stringify(indexes, null, 2));

  const fn = await runQuery(
    token,
    `
    SELECT proname FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname = 'increment_event_ticket_sold';
    `,
  );
  console.log("Function:", JSON.stringify(fn, null, 2));

  const table = await runQuery(
    token,
    `SELECT to_regclass('public.auction_vault_setups') AS auction_vault_setups;`,
  );
  console.log("Table:", JSON.stringify(table, null, 2));
  console.log("\nDone. Guide: docs/runbooks/apply-audit-migrations.md");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
