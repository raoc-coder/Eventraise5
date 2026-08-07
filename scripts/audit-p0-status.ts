/**
 * Phase Audit Hardening — P0 ops gate status.
 *
 * Checks env flags, admin role audit (service role), and optionally
 * migration 033 objects via Supabase Management API when logged in.
 *
 *   npx tsx scripts/audit-p0-status.ts
 *   npx tsx scripts/audit-p0-status.ts --json
 */
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { homedir } from "os";
import { createClient } from "@supabase/supabase-js";

const PROJECT_REF = "yxzypekwyuopbanroobr";

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

function flag(name: string, env: Record<string, string>): "set" | "missing" {
  return env[name]?.trim() ? "set" : "missing";
}

function accessToken(): string | null {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  const p = join(homedir(), ".supabase", "access-token");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8").trim() || null;
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

type Check = { id: string; ok: boolean; detail: string };

async function main() {
  const env = loadEnv();
  const asJson = process.argv.includes("--json");
  const checks: Check[] = [];

  // --- Env (P0.3 / P0.5 readiness) ---
  const webhookId = flag("PAYPAL_WEBHOOK_ID", env);
  const skipVerify = env.PAYPAL_WEBHOOK_SKIP_VERIFY === "true";
  const paypalEnv = (env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  const adminPassword = flag("PLATFORM_ADMIN_PASSWORD", env);

  checks.push({
    id: "P0.3.webhook_id_local",
    ok: webhookId === "set",
    detail:
      webhookId === "set"
        ? "PAYPAL_WEBHOOK_ID set in local env"
        : "PAYPAL_WEBHOOK_ID missing — set in .env.local and Vercel Production/Preview",
  });

  checks.push({
    id: "P0.3.skip_verify_safe",
    ok: !(skipVerify && paypalEnv === "production"),
    detail: skipVerify
      ? paypalEnv === "production"
        ? "UNSAFE: PAYPAL_WEBHOOK_SKIP_VERIFY=true with production PayPal"
        : "PAYPAL_WEBHOOK_SKIP_VERIFY=true (allowed only for non-production)"
      : "Webhook skip flag unset (good)",
  });

  checks.push({
    id: "P0.5.admin_password_present",
    ok: adminPassword === "set",
    detail:
      adminPassword === "set"
        ? "PLATFORM_ADMIN_PASSWORD present locally — rotate in Vercel if not yet done post-audit"
        : "PLATFORM_ADMIN_PASSWORD missing",
  });

  // --- Role audit (P0.4) ---
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    checks.push({
      id: "P0.4.role_audit",
      ok: false,
      detail: "Cannot audit profiles — missing Supabase URL or service role key",
    });
  } else {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: adminProfiles, error: pe } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("role", "admin");

    if (pe) {
      checks.push({ id: "P0.4.role_audit", ok: false, detail: `profiles query failed: ${pe.message}` });
    } else {
      const { data: roster } = await admin
        .from("platform_admins")
        .select("id, email, user_id, is_active")
        .eq("is_active", true);

      const rosterEmails = new Set((roster || []).map((r) => String(r.email || "").toLowerCase()));
      const rosterUserIds = new Set(
        (roster || []).map((r) => String(r.user_id || "")).filter(Boolean),
      );
      const ownerEmails = new Set(
        (env.OWNER_ADMIN_EMAILS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      );
      const ownerIds = new Set(
        (env.OWNER_USER_IDS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      );

      const orphans: string[] = [];
      for (const p of adminProfiles || []) {
        const email = String(p.email || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        const ok =
          rosterEmails.has(email) ||
          rosterUserIds.has(p.id) ||
          ownerEmails.has(email) ||
          ownerIds.has(id);
        if (!ok) orphans.push(`${p.email || "(no email)"} (${p.id})`);
      }

      checks.push({
        id: "P0.4.role_audit",
        ok: orphans.length === 0,
        detail:
          orphans.length === 0
            ? `OK — ${(adminProfiles || []).length} profile(s) with role=admin; all tied to platform_admins or OWNER_* (${(adminProfiles || []).map((p) => p.email).join(", ") || "none"})`
            : `ORPHAN admin role(s) to revoke: ${orphans.join("; ")}`,
      });
    }
  }

  // --- Migration 033 (P0.1 / P0.2) via Management API ---
  const token = accessToken();
  if (!token) {
    checks.push({
      id: "P0.1.migration_033",
      ok: false,
      detail:
        "Cannot verify triggers — run `supabase login` or set SUPABASE_ACCESS_TOKEN, then: npm run audit:p0:apply",
    });
  } else {
    try {
      const rows = (await runQuery(
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
        ORDER BY t.tgname;
        `,
      )) as { tgname: string }[];

      const names = new Set((rows || []).map((r) => r.tgname));
      const haveRole = names.has("trg_prevent_profile_role_self_escalation");
      const haveTotals = names.has("trg_protect_personal_campaign_totals");

      checks.push({
        id: "P0.1.migration_033",
        ok: haveRole && haveTotals,
        detail:
          haveRole && haveTotals
            ? "Migration 033 triggers present on linked project"
            : `Missing triggers — have=[${[...names].join(",")}] need role+totals. Run: npm run audit:p0:apply`,
      });

      const policies = (await runQuery(
        token,
        `
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND policyname IN (
            'paypal_orders_insert_deny_clients',
            'donations_insert_deny_clients'
          );
        `,
      )) as { policyname: string; tablename: string }[];

      const policyNames = new Set((policies || []).map((p) => p.policyname));
      checks.push({
        id: "P0.1.rls_deny_policies",
        ok: policyNames.has("paypal_orders_insert_deny_clients"),
        detail: policyNames.has("paypal_orders_insert_deny_clients")
          ? `RLS deny policies present: ${[...policyNames].join(", ")}`
          : "paypal_orders_insert_deny_clients missing — apply migration 033",
      });
    } catch (e) {
      checks.push({
        id: "P0.1.migration_033",
        ok: false,
        detail: `Management API query failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  const allOk = checks.every((c) => c.ok);
  const report = {
    phase: "audit-hardening-p0",
    projectRef: PROJECT_REF,
    allOk,
    checks,
    next: allOk
      ? ["Run npm run audit:p0:smoke", "Start Sprint 6 (docs/phase-audit-hardening.md)"]
      : [
          "npm run audit:p0:apply  (after supabase login)",
          "Set PAYPAL_WEBHOOK_ID on Vercel Production + Preview",
          "Rotate PLATFORM_ADMIN_PASSWORD if not done post-audit",
          "See docs/runbooks/audit-p0-ops-gate.md",
        ],
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("=== Phase Audit Hardening — P0 ops gate ===\n");
    for (const c of checks) {
      console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.id}`);
      console.log(`       ${c.detail}`);
    }
    console.log(`\nOverall: ${allOk ? "READY" : "BLOCKED — see FAIL items"}`);
    console.log("\nNext:");
    for (const n of report.next) console.log(`  • ${n}`);
    console.log("\nRunbook: docs/runbooks/audit-p0-ops-gate.md");
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
