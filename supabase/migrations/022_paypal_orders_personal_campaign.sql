-- Migration 022: attribute PayPal orders to a P2P personal campaign (Sprint 1.5).
-- ADR refs: 0001 (SQL migrations), 0009 (idempotency), 0011 (integer cents), 0012 (RLS).
-- Depends on: 010 (paypal_orders), 021 (personal_campaigns).
-- Idempotent: safe to re-run.

ALTER TABLE public.paypal_orders
  ADD COLUMN IF NOT EXISTS personal_campaign_id UUID
  REFERENCES public.personal_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_paypal_orders_personal_campaign
  ON public.paypal_orders(personal_campaign_id);
