-- Ensure volunteer_shifts table exists and matches simple yes/no flow
-- Safe, idempotent adjustments compatible with existing deployments

-- 1) Create table if missing (with relaxed nullable times for simple asks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'volunteer_shifts'
  ) THEN
    CREATE TABLE public.volunteer_shifts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMP WITH TIME ZONE NULL,
      end_time TIMESTAMP WITH TIME ZONE NULL,
      max_volunteers INTEGER NOT NULL DEFAULT 0,
      current_volunteers INTEGER NOT NULL DEFAULT 0,
      requirements TEXT,
      skills_needed TEXT[],
      location TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- 2) Relax NOT NULL constraints if they exist from older schema
DO $$
BEGIN
  -- start_time nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='volunteer_shifts' AND column_name='start_time' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.volunteer_shifts ALTER COLUMN start_time DROP NOT NULL;
  END IF;

  -- end_time nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='volunteer_shifts' AND column_name='end_time' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.volunteer_shifts ALTER COLUMN end_time DROP NOT NULL;
  END IF;

  -- max_volunteers default 0 and NOT NULL
  ALTER TABLE public.volunteer_shifts ALTER COLUMN max_volunteers SET DEFAULT 0;
  UPDATE public.volunteer_shifts SET max_volunteers = 0 WHERE max_volunteers IS NULL;
  ALTER TABLE public.volunteer_shifts ALTER COLUMN max_volunteers SET NOT NULL;

  -- current_volunteers default 0 and NOT NULL
  ALTER TABLE public.volunteer_shifts ALTER COLUMN current_volunteers SET DEFAULT 0;
  UPDATE public.volunteer_shifts SET current_volunteers = 0 WHERE current_volunteers IS NULL;
  ALTER TABLE public.volunteer_shifts ALTER COLUMN current_volunteers SET NOT NULL;
END $$;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_event_id ON public.volunteer_shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_is_active ON public.volunteer_shifts(is_active);

-- 4) Enable RLS and minimal policies (view all, owners manage)
DO $$
BEGIN
  PERFORM 1 FROM pg_tables WHERE schemaname='public' AND tablename='volunteer_shifts';
  EXECUTE 'ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN
  -- ignore
END $$;

-- Viewable by everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='volunteer_shifts' AND policyname='Volunteer shifts are viewable by everyone'
  ) THEN
    CREATE POLICY "Volunteer shifts are viewable by everyone" ON public.volunteer_shifts
      FOR SELECT USING (true);
  END IF;
END $$;

-- Organizers can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='volunteer_shifts' AND policyname='Event organizers can manage shifts'
  ) THEN
    CREATE POLICY "Event organizers can manage shifts" ON public.volunteer_shifts
      FOR ALL USING (auth.uid() IN (SELECT COALESCE(organizer_id, created_by) FROM public.events WHERE id = event_id));
  END IF;
END $$;

-- 5) Updated-at trigger (optional if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_volunteer_shifts'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at_volunteer_shifts()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER handle_updated_at_volunteer_shifts
      BEFORE UPDATE ON public.volunteer_shifts
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_volunteer_shifts();
  END IF;
END $$;

COMMENT ON TABLE public.volunteer_shifts IS 'Volunteer opportunities for events; supports simple yes/no asks (nullable times).';


