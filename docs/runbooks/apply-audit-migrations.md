# Apply audit migrations 033 + 034 (production)

**Project:** `yxzypekwyuopbanroobr` (EventRaise Supabase)  
**When:** After Vercel Production has the audit-hardening code (already deployed).  
**Order:** Always **033 first**, then **034**.

| Migration | File | What it does |
|-----------|------|----------------|
| **033** | `supabase/migrations/033_security_hardening.sql` | Block `profiles.role` self-escalation; protect P2P totals; deny client INSERT on `paypal_orders` / legacy `donations` |
| **034** | `supabase/migrations/034_money_path_integrity.sql` | Unique `paypal_capture_id` indexes; `increment_event_ticket_sold`; `auction_vault_setups` table |

Both are **idempotent** (`IF NOT EXISTS` / `CREATE OR REPLACE`) — safe to re-run if a step fails mid-way.

---

## Option A — Supabase SQL Editor (recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **yxzypekwyuopbanroobr**.
2. Go to **SQL** → **New query**.
3. Open locally (or from GitHub `main`):
   - `supabase/migrations/033_security_hardening.sql`
4. Paste the **entire** file into the editor → **Run**.
5. Confirm success (no error).
6. New query → paste entire `supabase/migrations/034_money_path_integrity.sql` → **Run**.
7. Verify (new query) — paste:

```sql
-- 033 triggers
SELECT t.tgname, c.relname
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

-- 033 / 034 objects
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'uq_donation_requests_paypal_capture_id',
    'uq_event_registrations_paypal_capture_id'
  );

SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'increment_event_ticket_sold';

SELECT to_regclass('public.auction_vault_setups') AS auction_vault_setups;
```

**Expect:** 2 trigger rows, 2 index rows, 1 function row, `auction_vault_setups` not null.

Or use the repo files:
- `scripts/sql/audit-p0-verify-033.sql`
- `scripts/sql/audit-verify-034.sql`

---

## Option B — CLI (Management API)

From the repo root (needs network + Supabase login):

```bash
git checkout main
git pull origin main

# One-time auth (browser)
npx supabase login

# Apply both (033 then 034)
npm run audit:p0:apply          # 033
npm run audit:migrate:034       # 034

# Status (033 triggers + role audit)
npm run audit:p0:status
```

Dry-run (print SQL only):

```bash
npm run audit:p0:apply -- --dry-run
npm run audit:migrate:034 -- --dry-run
```

---

## If 034 fails: `column "paypal_capture_id" does not exist`

Your DB is missing columns that migration **010** was supposed to add. Re-run the **updated** `034` file from `main` (it now includes `ADD COLUMN IF NOT EXISTS` first), or paste this repair block then re-run 034:

```sql
ALTER TABLE public.donation_requests
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;
```

Then run the rest of `034_money_path_integrity.sql` (indexes + function + `auction_vault_setups`).

Duplicate `paypal_capture_id` values can block the unique index. Find them:

```sql
SELECT paypal_capture_id, COUNT(*)
FROM public.donation_requests
WHERE paypal_capture_id IS NOT NULL AND length(trim(paypal_capture_id)) > 0
GROUP BY 1
HAVING COUNT(*) > 1;

SELECT paypal_capture_id, COUNT(*)
FROM public.event_registrations
WHERE paypal_capture_id IS NOT NULL AND length(trim(paypal_capture_id)) > 0
GROUP BY 1
HAVING COUNT(*) > 1;
```

Resolve duplicates (keep one row per capture id), then re-run **034**.

---

## After migrations

1. `npm run audit:p0:status` — prefer PASS on migration checks (needs `supabase login`).
2. `npm run audit:p0:smoke -- --base https://www.eventraisehub.com`
3. Still set on Vercel if missing: `PAYPAL_WEBHOOK_ID`; rotate `PLATFORM_ADMIN_PASSWORD`.
4. Note completion in `LEDGER.md`.

**No Vercel redeploy is required** for SQL-only changes — the live app already expects these objects.
