# Runbook — Phase Audit Hardening P0 ops gate

**Plan:** [`docs/phase-audit-hardening.md`](../phase-audit-hardening.md)  
**Audit:** [`docs/PLATFORM_AUDIT_2026-08-07.md`](../PLATFORM_AUDIT_2026-08-07.md)  
**Project ref:** `yxzypekwyuopbanroobr`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run audit:p0:status` | Env + role audit + migration 033 presence (needs `supabase login` for triggers) |
| `npm run audit:p0:apply` | Apply `033_security_hardening.sql` via Management API |
| `npm run audit:p0:smoke` | HTTP smoke vs `NEXT_PUBLIC_APP_URL` (or `--base`) |

```bash
npx supabase login   # once — writes ~/.supabase/access-token
npm run audit:p0:apply
npm run audit:p0:status
npm run audit:p0:smoke -- --base https://www.eventraisehub.com
```

## Checklist

### P0.1 / P0.2 — Migration 033

1. `npx supabase login` (or set `SUPABASE_ACCESS_TOKEN`).
2. `npm run audit:p0:apply`
3. Confirm `audit:p0:status` shows triggers + `paypal_orders_insert_deny_clients`.
4. Optional: paste [`scripts/sql/audit-p0-verify-033.sql`](../../scripts/sql/audit-p0-verify-033.sql) in Supabase SQL editor.

**Staging:** if you use a separate Supabase project, change `PROJECT_REF` in the apply script or run the SQL file manually there first.

### P0.3 — PayPal webhook ID

1. PayPal Developer Dashboard → Webhooks → copy Webhook ID.
2. Vercel → Project → Settings → Environment Variables:
   - `PAYPAL_WEBHOOK_ID` = \<id\> (Production + Preview)
   - Ensure `PAYPAL_WEBHOOK_SKIP_VERIFY` is **not** set in Production
3. Redeploy.
4. Mirror in `.env.local` for local status checks.

### P0.4 — Profile role audit

1. `npm run audit:p0:status` — lists orphan `profiles.role = 'admin'`.
2. Or run [`scripts/sql/audit-p0-role-audit.sql`](../../scripts/sql/audit-p0-role-audit.sql).
3. Revoke orphans: `UPDATE profiles SET role = 'user' WHERE id = '…';` (service role / SQL editor).
4. Legitimate rows should match `platform_admins` or `OWNER_ADMIN_EMAILS` / `OWNER_USER_IDS`.

### P0.5 — Rotate admin password

1. Generate a new strong secret; store in password manager.
2. Update `PLATFORM_ADMIN_PASSWORD` on Vercel (Production + Preview + Development) **and** `.env.local`.
3. Redeploy; confirm `/admin/login` with new password; confirm old password fails.
4. Do **not** commit the password.

### P0.6 — Smoke

1. Prefer production/staging URL after deploy:  
   `npm run audit:p0:smoke -- --base https://www.eventraisehub.com`
2. Manual (authenticated) — from QA runbook:
   - Organizer cannot set payout status `completed` (expect 403).
   - Cashout with missing owner fields returns 403.
3. Ticket underpayment: smoke script attempts create-order with `$0.01` for a paid ticket and checks stored `amount_cents`.

## Exit

All of `audit:p0:status` PASS, smoke PASS, password rotated, webhook ID on Vercel → mark P0 complete in `LEDGER.md` and start **Sprint 6**.
