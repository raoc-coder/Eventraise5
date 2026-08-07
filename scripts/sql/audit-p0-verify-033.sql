-- Audit P0 — verify migration 033 objects
-- Paste into Supabase SQL editor (project yxzypekwyuopbanroobr)

SELECT t.tgname AS trigger_name, c.relname AS table_name
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

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname IN (
    'paypal_orders_insert_deny_clients',
    'donations_insert_deny_clients',
    'donations_update_deny_clients'
  )
ORDER BY 1, 2;

-- Expect: both triggers present; paypal_orders_insert_deny_clients present
