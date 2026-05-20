-- Migration 029: Auction lot settlement / capture tracking (Sprint 3 / S3.3)
-- ADR refs: 0006, 0009

ALTER TABLE public.auction_lots
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT,
  ADD COLUMN IF NOT EXISTS capture_idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_auction_lots_capture_idempotency
  ON public.auction_lots(capture_idempotency_key)
  WHERE capture_idempotency_key IS NOT NULL;
