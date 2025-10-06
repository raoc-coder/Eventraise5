-- Make create_event_payout idempotent: if a pending payout exists for the event, update it and refresh items

CREATE OR REPLACE FUNCTION public.create_event_payout(event_uuid UUID)
RETURNS UUID AS $$
DECLARE
  payout_id UUID;
  organizer_uuid UUID;
  gross_total INTEGER;
  fees_total INTEGER;
  net_total INTEGER;
BEGIN
  SELECT organizer_id INTO organizer_uuid FROM public.events WHERE id = event_uuid;
  IF organizer_uuid IS NULL THEN
    RAISE EXCEPTION 'Event organizer not found for event %', event_uuid;
  END IF;

  SELECT 
    COALESCE(SUM(amount_cents), 0),
    COALESCE(SUM(fee_cents), 0),
    COALESCE(SUM(net_cents), 0)
  INTO gross_total, fees_total, net_total
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status IN ('succeeded', 'completed')
    AND settlement_status = 'settled';

  -- Check for existing pending payout
  SELECT id INTO payout_id FROM public.event_payouts
  WHERE event_id = event_uuid AND organizer_id = organizer_uuid AND payout_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF payout_id IS NULL THEN
    -- Create new payout
    INSERT INTO public.event_payouts (
      event_id, organizer_id, total_gross_cents, total_fees_cents, total_net_cents
    ) VALUES (
      event_uuid, organizer_uuid, gross_total, fees_total, net_total
    ) RETURNING id INTO payout_id;
  ELSE
    -- Update existing payout totals
    UPDATE public.event_payouts
    SET total_gross_cents = gross_total,
        total_fees_cents = fees_total,
        total_net_cents = net_total,
        updated_at = NOW()
    WHERE id = payout_id;

    -- Refresh payout items
    DELETE FROM public.payout_items WHERE payout_id = payout_id;
  END IF;

  -- Insert payout items from eligible donations
  INSERT INTO public.payout_items (payout_id, donation_id, amount_cents, fee_cents, net_cents)
  SELECT payout_id, id, amount_cents, fee_cents, net_cents
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status IN ('succeeded', 'completed')
    AND settlement_status = 'settled';

  RETURN payout_id;
END;
$$ LANGUAGE plpgsql;


