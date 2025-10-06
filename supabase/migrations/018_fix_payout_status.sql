-- Fix payout aggregation to use correct donation status ('succeeded')
-- Also support legacy 'completed' if any rows exist from older code

CREATE OR REPLACE FUNCTION public.create_event_payout(event_uuid UUID)
RETURNS UUID AS $$
DECLARE
  payout_id UUID;
  organizer_uuid UUID;
  gross_total INTEGER;
  fees_total INTEGER;
  net_total INTEGER;
BEGIN
  -- Get the event organizer
  SELECT organizer_id INTO organizer_uuid 
  FROM public.events 
  WHERE id = event_uuid;
  
  IF organizer_uuid IS NULL THEN
    RAISE EXCEPTION 'Event organizer not found for event %', event_uuid;
  END IF;
  
  -- Calculate totals for completed (succeeded) donations
  SELECT 
    COALESCE(SUM(amount_cents), 0),
    COALESCE(SUM(fee_cents), 0),
    COALESCE(SUM(net_cents), 0)
  INTO gross_total, fees_total, net_total
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status IN ('succeeded', 'completed')
    AND settlement_status = 'settled';
  
  -- Create the payout record
  INSERT INTO public.event_payouts (
    event_id, 
    organizer_id, 
    total_gross_cents, 
    total_fees_cents, 
    total_net_cents
  ) VALUES (
    event_uuid,
    organizer_uuid,
    gross_total,
    fees_total,
    net_total
  ) RETURNING id INTO payout_id;
  
  -- Create payout items for each donation
  INSERT INTO public.payout_items (
    payout_id,
    donation_id,
    amount_cents,
    fee_cents,
    net_cents
  )
  SELECT 
    payout_id,
    id,
    amount_cents,
    fee_cents,
    net_cents
  FROM public.donation_requests
  WHERE event_id = event_uuid 
    AND status IN ('succeeded', 'completed')
    AND settlement_status = 'settled';
  
  RETURN payout_id;
END;
$$ LANGUAGE plpgsql;


