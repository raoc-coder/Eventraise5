-- Fix donation thermometer by adding event_id to donation_requests and creating trigger to update event.total_raised

-- Add event_id to donation_requests if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donation_requests' 
        AND column_name = 'event_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.donation_requests 
        ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_donation_requests_event_id ON public.donation_requests(event_id);
    END IF;
END $$;

-- Add total_raised to events if it doesn't exist (as INTEGER in cents)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'total_raised'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events 
        ADD COLUMN total_raised INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to update event total_raised when donation status changes
CREATE OR REPLACE FUNCTION public.update_event_total_raised()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if event_id is set
  IF NEW.event_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- When a donation succeeds
  IF TG_OP = 'INSERT' AND NEW.status = 'succeeded' THEN
    UPDATE public.events 
    SET total_raised = COALESCE(total_raised, 0) + NEW.amount_cents
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;

  -- When status changes to succeeded
  IF TG_OP = 'UPDATE' AND OLD.status != 'succeeded' AND NEW.status = 'succeeded' THEN
    UPDATE public.events 
    SET total_raised = COALESCE(total_raised, 0) + NEW.amount_cents
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;

  -- When status changes from succeeded to something else (refund/cancel)
  IF TG_OP = 'UPDATE' AND OLD.status = 'succeeded' AND NEW.status != 'succeeded' THEN
    UPDATE public.events 
    SET total_raised = GREATEST(0, COALESCE(total_raised, 0) - OLD.amount_cents)
    WHERE id = OLD.event_id;
    RETURN NEW;
  END IF;

  -- When amount changes and status is succeeded
  IF TG_OP = 'UPDATE' AND NEW.status = 'succeeded' AND OLD.amount_cents != NEW.amount_cents THEN
    UPDATE public.events 
    SET total_raised = COALESCE(total_raised, 0) - OLD.amount_cents + NEW.amount_cents
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update event total_raised
DROP TRIGGER IF EXISTS trigger_update_event_total_raised ON public.donation_requests;
CREATE TRIGGER trigger_update_event_total_raised
  AFTER INSERT OR UPDATE ON public.donation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_total_raised();

-- Backfill: Calculate total_raised for all events based on succeeded donations
UPDATE public.events e
SET total_raised = COALESCE((
  SELECT SUM(amount_cents)
  FROM public.donation_requests dr
  WHERE dr.event_id = e.id
    AND dr.status = 'succeeded'
), 0)
WHERE EXISTS (
  SELECT 1 FROM public.donation_requests dr2
  WHERE dr2.event_id = e.id
);

