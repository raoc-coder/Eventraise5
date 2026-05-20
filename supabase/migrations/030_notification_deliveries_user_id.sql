-- Migration 030: user_id on notification_deliveries (Sprint 4 / ADR-0009)

ALTER TABLE public.notification_deliveries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user
  ON public.notification_deliveries(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_pending
  ON public.notification_deliveries(status)
  WHERE status = 'pending';

ALTER TABLE public.notification_deliveries
  DROP CONSTRAINT IF EXISTS notification_deliveries_dedupe_key_channel_key;

DROP INDEX IF EXISTS notification_deliveries_dedupe_key_channel_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_deliveries_user_dedupe_channel
  ON public.notification_deliveries(user_id, dedupe_key, channel)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_deliveries_dedupe_channel_legacy
  ON public.notification_deliveries(dedupe_key, channel)
  WHERE user_id IS NULL;
