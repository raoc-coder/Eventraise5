-- P0: Vault secrets for notify-outbid pg_net trigger (run once in Supabase SQL Editor)
-- Project: yxzypekwyuopbanroobr
-- Prerequisite: Edge function deployed (`supabase functions deploy notify-outbid`)
--
-- Replace placeholders before running:
--   SERVICE_ROLE_JWT = Dashboard → Settings → API → service_role (secret)
-- Or generate SQL without pasting JWT: npx tsx scripts/p0-print-vault-sql.ts

-- Idempotent: skip if names already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'notify_outbid_edge_url') THEN
    PERFORM vault.create_secret(
      'https://yxzypekwyuopbanroobr.supabase.co/functions/v1/notify-outbid',
      'notify_outbid_edge_url',
      'notify-outbid Edge URL'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'notify_outbid_service_role') THEN
    PERFORM vault.create_secret(
      'SERVICE_ROLE_JWT',
      'notify_outbid_service_role',
      'Bearer token for Edge invoke'
    );
  END IF;
END $$;

-- Verify
SELECT name, created_at FROM vault.secrets
WHERE name IN ('notify_outbid_edge_url', 'notify_outbid_service_role');

SELECT tgname FROM pg_trigger WHERE tgname = 'bids_notify_outbid_enqueue';

SELECT extname FROM pg_extension WHERE extname = 'pg_net';
