-- Migration 024: Auctions, lots, registrations, bids (Sprint 3 / Epic 2 kick-off)
-- ADR refs: 0001, 0006 (vault token storage only), 0007 (increments; anti-snipe extension → Sprint 4), 0009, 0011, 0012
-- Depends on: 001 (events), auth.users

-- 1) Auctions (one per event slug namespace; parent event for organizer context)
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'closed')),
  mode TEXT NOT NULL DEFAULT 'silent'
    CHECK (mode IN ('silent', 'live')),
  anti_snipe_enabled BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_auctions_event ON public.auctions(event_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_auctions'
  ) THEN
    CREATE TRIGGER handle_updated_at_auctions
      BEFORE UPDATE ON public.auctions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 2) Lots
CREATE TABLE IF NOT EXISTS public.auction_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  starting_bid_cents INTEGER NOT NULL CHECK (starting_bid_cents >= 0),
  min_increment_cents INTEGER NOT NULL CHECK (min_increment_cents > 0),
  current_high_bid_cents INTEGER NOT NULL DEFAULT 0 CHECK (current_high_bid_cents >= 0),
  reserve_cents INTEGER CHECK (reserve_cents IS NULL OR reserve_cents >= 0),
  closes_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'closed', 'settled', 'capture_failed')),
  extension_count INTEGER NOT NULL DEFAULT 0 CHECK (extension_count >= 0 AND extension_count <= 5),
  winning_bid_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auction_lots_auction ON public.auction_lots(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_lots_status_closes ON public.auction_lots(status, closes_at);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_auction_lots'
  ) THEN
    CREATE TRIGGER handle_updated_at_auction_lots
      BEFORE UPDATE ON public.auction_lots
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 3) Registrations (vault token only; ADR-0006 — never store PAN/CVV)
CREATE TABLE IF NOT EXISTS public.auction_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended')),
  client_idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (auction_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_auction_registrations_idempotency
  ON public.auction_registrations(auction_id, client_idempotency_key)
  WHERE client_idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auction_registrations_user ON public.auction_registrations(user_id);

-- 4) Bids
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES public.auction_lots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  client_idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lot_id, user_id, client_idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_bids_lot ON public.bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_user ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_lot_amount ON public.bids(lot_id, amount_cents DESC);

ALTER TABLE public.auction_lots
  DROP CONSTRAINT IF EXISTS fk_auction_lots_winning_bid;
ALTER TABLE public.auction_lots
  ADD CONSTRAINT fk_auction_lots_winning_bid
  FOREIGN KEY (winning_bid_id) REFERENCES public.bids(id) ON DELETE SET NULL;

-- 5) Atomic bid placement (row lock + increment rule; ADR-0009 idempotency)
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
    RETURN jsonb_build_object('ok', true, 'bid_id', v_bid_id, 'replay', true);
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

  INSERT INTO public.bids (lot_id, user_id, amount_cents, client_idempotency_key)
  VALUES (p_lot_id, v_uid, p_amount_cents, trim(p_idempotency_key))
  RETURNING id INTO v_bid_id;

  UPDATE public.auction_lots
  SET current_high_bid_cents = p_amount_cents, updated_at = now()
  WHERE id = p_lot_id;

  RETURN jsonb_build_object('ok', true, 'bid_id', v_bid_id);
END;
$$;

REVOKE ALL ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(UUID, INTEGER, TEXT) TO service_role;

-- 6) RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auctions_select_published ON public.auctions;
CREATE POLICY auctions_select_published ON public.auctions
  FOR SELECT USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

DROP POLICY IF EXISTS auctions_manage_owner ON public.auctions;
DROP POLICY IF EXISTS auctions_insert_creator ON public.auctions;
CREATE POLICY auctions_insert_creator ON public.auctions
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
    )
  );

DROP POLICY IF EXISTS auctions_update_staff ON public.auctions;
CREATE POLICY auctions_update_staff ON public.auctions
  FOR UPDATE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS auctions_delete_staff ON public.auctions;
CREATE POLICY auctions_delete_staff ON public.auctions
  FOR DELETE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS auctions_select_staff ON public.auctions;
CREATE POLICY auctions_select_staff ON public.auctions
  FOR SELECT USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = auctions.event_id
        AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS auction_lots_select_published ON public.auction_lots;
CREATE POLICY auction_lots_select_published ON public.auction_lots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      JOIN public.events e ON e.id = a.event_id
      WHERE a.id = auction_lots.auction_id
        AND a.status = 'published'
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
    OR EXISTS (
      SELECT 1 FROM public.auctions a2
      WHERE a2.id = auction_lots.auction_id
        AND (
          auth.uid() = a2.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e2
            WHERE e2.id = a2.event_id AND auth.uid() = COALESCE(e2.organizer_id, e2.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );

DROP POLICY IF EXISTS auction_lots_manage_owner ON public.auction_lots;
DROP POLICY IF EXISTS auction_lots_insert_staff ON public.auction_lots;
CREATE POLICY auction_lots_insert_staff ON public.auction_lots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_lots.auction_id
        AND (
          auth.uid() = a.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = a.event_id AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );

DROP POLICY IF EXISTS auction_lots_update_staff ON public.auction_lots;
CREATE POLICY auction_lots_update_staff ON public.auction_lots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_lots.auction_id
        AND (
          auth.uid() = a.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = a.event_id AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_lots.auction_id
        AND (
          auth.uid() = a.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = a.event_id AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );

DROP POLICY IF EXISTS auction_lots_delete_staff ON public.auction_lots;
CREATE POLICY auction_lots_delete_staff ON public.auction_lots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_lots.auction_id
        AND (
          auth.uid() = a.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = a.event_id AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );

DROP POLICY IF EXISTS auction_registrations_select_self ON public.auction_registrations;
CREATE POLICY auction_registrations_select_self ON public.auction_registrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS auction_registrations_insert_self ON public.auction_registrations;
CREATE POLICY auction_registrations_insert_self ON public.auction_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.auctions a
      JOIN public.events e ON e.id = a.event_id
      WHERE a.id = auction_registrations.auction_id
        AND a.status = 'published'
        AND (e.is_published IS TRUE OR e.is_published IS NULL)
    )
  );

DROP POLICY IF EXISTS auction_registrations_update_self ON public.auction_registrations;
CREATE POLICY auction_registrations_update_self ON public.auction_registrations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bids_select_self ON public.bids;
CREATE POLICY bids_select_self ON public.bids
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.auction_lots l
      JOIN public.auctions a ON a.id = l.auction_id
      WHERE l.id = bids.lot_id
        AND (
          auth.uid() = a.created_by
          OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = a.event_id AND auth.uid() = COALESCE(e.organizer_id, e.created_by)
          )
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );
