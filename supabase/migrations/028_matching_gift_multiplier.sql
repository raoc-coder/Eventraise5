-- Migration 028: apply matching_gifts.multiplier to consumed_cents (Sprint 2 / S2.7)

CREATE OR REPLACE FUNCTION public.matching_gift_increment(
  p_donation_cents INTEGER,
  p_multiplier NUMERIC,
  p_cap_cents INTEGER,
  p_consumed_cents INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  IF p_donation_cents IS NULL OR p_donation_cents <= 0 THEN
    RETURN 0;
  END IF;
  RETURN LEAST(
    ROUND(p_donation_cents * GREATEST(p_multiplier, 0.01))::INTEGER,
    GREATEST(0, p_cap_cents - p_consumed_cents)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.apply_matching_gift_from_donations()
RETURNS TRIGGER AS $$
DECLARE
  v_delta INTEGER;
  v_room INTEGER;
  v_inc INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.event_id IS NOT NULL AND NEW.status = 'succeeded' THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = mg.consumed_cents + public.matching_gift_increment(
        NEW.amount_cents, mg.multiplier, mg.cap_cents, mg.consumed_cents
      )
      WHERE mg.event_id = NEW.event_id
        AND mg.status = 'active'
        AND mg.consumed_cents < mg.cap_cents;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF COALESCE(NEW.event_id, OLD.event_id) IS NULL THEN
      RETURN NEW;
    END IF;

    IF OLD.status = 'succeeded' AND NEW.status <> 'succeeded' AND OLD.event_id IS NOT NULL THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = GREATEST(
        0,
        mg.consumed_cents - public.matching_gift_increment(
          OLD.amount_cents, mg.multiplier, mg.cap_cents, mg.consumed_cents
        )
      )
      WHERE mg.event_id = OLD.event_id AND mg.status = 'active';
      RETURN NEW;
    END IF;

    IF OLD.status <> 'succeeded' AND NEW.status = 'succeeded' AND NEW.event_id IS NOT NULL THEN
      UPDATE public.matching_gifts mg
      SET consumed_cents = mg.consumed_cents + public.matching_gift_increment(
        NEW.amount_cents, mg.multiplier, mg.cap_cents, mg.consumed_cents
      )
      WHERE mg.event_id = NEW.event_id
        AND mg.status = 'active'
        AND mg.consumed_cents < mg.cap_cents;
      RETURN NEW;
    END IF;

    IF OLD.status = 'succeeded' AND NEW.status = 'succeeded' THEN
      IF OLD.event_id IS DISTINCT FROM NEW.event_id THEN
        IF OLD.event_id IS NOT NULL THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = GREATEST(
            0,
            mg.consumed_cents - public.matching_gift_increment(
              OLD.amount_cents, mg.multiplier, mg.cap_cents, mg.consumed_cents
            )
          )
          WHERE mg.event_id = OLD.event_id AND mg.status = 'active';
        END IF;
        IF NEW.event_id IS NOT NULL THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = mg.consumed_cents + public.matching_gift_increment(
            NEW.amount_cents, mg.multiplier, mg.cap_cents, mg.consumed_cents
          )
          WHERE mg.event_id = NEW.event_id
            AND mg.status = 'active'
            AND mg.consumed_cents < mg.cap_cents;
        END IF;
        RETURN NEW;
      END IF;

      IF NEW.event_id IS NOT NULL AND OLD.amount_cents IS DISTINCT FROM NEW.amount_cents THEN
        v_delta := NEW.amount_cents - OLD.amount_cents;
        IF v_delta > 0 THEN
          UPDATE public.matching_gifts mg
          SET consumed_cents = mg.consumed_cents + public.matching_gift_increment(
            v_delta, mg.multiplier, mg.cap_cents, mg.consumed_cents
          )
          WHERE mg.event_id = NEW.event_id
            AND mg.status = 'active'
            AND mg.consumed_cents < mg.cap_cents;
        ELSIF v_delta < 0 THEN
          v_room := -v_delta;
          UPDATE public.matching_gifts mg
          SET consumed_cents = GREATEST(
            0,
            mg.consumed_cents - LEAST(
              public.matching_gift_increment(v_room, mg.multiplier, mg.cap_cents, mg.consumed_cents),
              mg.consumed_cents
            )
          )
          WHERE mg.event_id = NEW.event_id AND mg.status = 'active';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
