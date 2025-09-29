-- Add missing columns that may not exist in the live database
-- This is a safe migration that won't fail if columns already exist

-- Add created_by to events if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add organizer_id to events if missing (for backward compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'organizer_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add goal_amount to events if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'goal_amount'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN goal_amount DECIMAL(10,2);
    END IF;
END $$;

-- Add is_published to events if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'is_published'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_public to events if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
