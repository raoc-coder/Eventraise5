-- Verify migration 034 (Sprint 7 money-path integrity)
-- Paste into Supabase SQL editor after applying 034_money_path_integrity.sql

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'uq_donation_requests_paypal_capture_id',
    'uq_event_registrations_paypal_capture_id'
  )
ORDER BY 1;

SELECT proname
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'increment_event_ticket_sold';

SELECT to_regclass('public.auction_vault_setups') AS auction_vault_setups;

-- Expect: 2 indexes, 1 function, auction_vault_setups = 'auction_vault_setups'
