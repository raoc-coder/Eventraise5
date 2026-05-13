-- Migration 026: Anti-snipe in place_auction_bid + Realtime for auction_lots (Sprint 4 / S4.2, S4.1 partial)
-- ADR refs: 0007 (anti-snipe), 0002, 0012 (sanitized payloads — clients use lot row, no bidder PII)
-- Depends on: 024 (auctions, auction_lots, bids, place_auction_bid)

-- Expose lot row updates to Supabase Realtime (clients filter by lot id; RLS still applies).
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_lots;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;

CREATE OR REPLACE FUNCTION public.place_auction_bid(
  p_lot_id UUID,
  p_amount_cents INTEGER,
  p_idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_lot public.auction_lots%ROWTYPE;
  v_min INTEGER;
  v_bid_id UUID;
  v_mode TEXT;
  v_snipe_flag BOOLEAN;
  v_snipe_active BOOLEAN;
  v_extended BOOLEAN := false;
  v_closes_after TIMESTAMPTZ;
  v_ext_count INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 OR length(p_idempotency_key) > 200 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_idempotency');
  END IF;

  SELECT b.id INTO v_bid_id
  FROM public.bids b
  WHERE b.lot_id = p_lot_id
    AND b.user_id = v_uid
    AND b.client_idempotency_key = p_idempotency_key
  LIMIT 1;

  IF v_bid_id IS NOT NULL THEN
    SELECT l.closes_at, l.extension_count
    INTO v_closes_after, v_ext_count
    FROM public.auction_lots l
    WHERE l.id = p_lot_id;
    RETURN jsonb_build_object(
      'ok', true,
      'bid_id', v_bid_id,
      'replay', true,
      'closes_at', v_closes_after,
      'extension_count', v_ext_count
    );
  END IF;

  SELECT * INTO v_lot FROM public.auction_lots WHERE id = p_lot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'lot_not_found');
  END IF;

  IF v_lot.status <> 'open' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'lot_not_open');
  END IF;

  IF v_lot.closes_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'lot_closed');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.auction_registrations r
    WHERE r.auction_id = v_lot.auction_id
      AND r.user_id = v_uid
      AND r.status IN ('pending', 'active')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_registered');
  END IF;

  IF v_lot.current_high_bid_cents = 0 THEN
    v_min := v_lot.starting_bid_cents;
  ELSE
    v_min := v_lot.current_high_bid_cents + v_lot.min_increment_cents;
  END IF;

  IF p_amount_cents < v_min THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'below_increment',
      'min_required_cents', v_min
    );
  END IF;

  SELECT a.mode, a.anti_snipe_enabled
  INTO v_mode, v_snipe_flag
  FROM public.auctions a
  WHERE a.id = v_lot.auction_id;

  v_snipe_active := (COALESCE(v_mode, 'silent') = 'live' OR COALESCE(v_snipe_flag, false));

  INSERT INTO public.bids (lot_id, user_id, amount_cents, client_idempotency_key)
  VALUES (p_lot_id, v_uid, p_amount_cents, trim(p_idempotency_key))
  RETURNING id INTO v_bid_id;

  UPDATE public.auction_lots
  SET current_high_bid_cents = p_amount_cents, updated_at = now()
  WHERE id = p_lot_id;

  IF v_snipe_active
     AND v_lot.extension_count < 5
     AND now() >= (v_lot.closes_at - interval '60 seconds')
     AND now() < v_lot.closes_at THEN
    UPDATE public.auction_lots
    SET
      closes_at = closes_at + interval '120 seconds',
      extension_count = extension_count + 1,
      updated_at = now()
    WHERE id = p_lot_id;
    v_extended := true;
  END IF;

  SELECT l.closes_at, l.extension_count
  INTO v_closes_after, v_ext_count
  FROM public.auction_lots l
  WHERE l.id = p_lot_id;

  RETURN jsonb_build_object(
    'ok', true,
    'bid_id', v_bid_id,
    'lot_extended', v_extended,
    'closes_at', v_closes_after,
    'extension_count', v_ext_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) TO service_role;
