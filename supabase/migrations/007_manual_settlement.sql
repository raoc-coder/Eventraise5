-- Manual settlement support: extend donation_requests

ALTER TABLE public.donation_requests
  ADD COLUMN IF NOT EXISTS braintree_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS fee_cents INTEGER,
  ADD COLUMN IF NOT EXISTS net_cents INTEGER,
  ADD COLUMN IF NOT EXISTS settlement_status TEXT CHECK (settlement_status IN ('pending','settled','failed'));

-- Backfill settlement_status for completed/failed rows if any
UPDATE public.donation_requests
SET settlement_status = CASE
  WHEN status = 'succeeded' OR status = 'completed' THEN 'settled'
  WHEN status = 'failed' THEN 'failed'
  ELSE 'pending'
END
WHERE settlement_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_donation_requests_bt_txn ON public.donation_requests(braintree_transaction_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_settlement_status ON public.donation_requests(settlement_status);


