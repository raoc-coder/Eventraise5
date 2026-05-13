-- Migration 027: pg_net enqueue on new bids → Edge Function notify-outbid (Sprint 4 / S4.5)
-- ADR refs: 0008, 0009 (dedupe keys on deliveries), pg_net operational readiness
-- Depends on: 024 (bids), 025 (notification_deliveries), pg_net + Vault on project
--
-- After migrate: Vault → Create secrets (SQL editor, postgres role):
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1/notify-outbid', 'notify_outbid_edge_url');
--   select vault.create_secret('<service_role_jwt>', 'notify_outbid_service_role');
-- Until both exist, the trigger no-ops (no HTTP call).

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_outbid_http_enqueue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_url text;
  v_secret text;
  v_headers jsonb;
  v_body jsonb;
BEGIN
  SELECT ds.decrypted_secret INTO v_url
  FROM vault.decrypted_secrets AS ds
  WHERE ds.name = 'notify_outbid_edge_url'
  LIMIT 1;

  IF v_url IS NULL OR length(trim(v_url)) = 0 THEN
    RETURN NEW;
  END IF;

  SELECT ds.decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets AS ds
  WHERE ds.name = 'notify_outbid_service_role'
  LIMIT 1;

  IF v_secret IS NULL OR length(trim(v_secret)) = 0 THEN
    RETURN NEW;
  END IF;

  v_body := jsonb_build_object('bid_id', NEW.id, 'lot_id', NEW.lot_id);
  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || trim(v_secret)
  );

  PERFORM net.http_post(
    url := trim(v_url),
    headers := v_headers,
    body := v_body,
    timeout_milliseconds := 10000
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_outbid_http_enqueue() FROM PUBLIC;

DROP TRIGGER IF EXISTS bids_notify_outbid_enqueue ON public.bids;
CREATE TRIGGER bids_notify_outbid_enqueue
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_outbid_http_enqueue();
