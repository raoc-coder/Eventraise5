-- Add slug column to events and backfill from title

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slug for existing rows: lowercase, replace non-alphanum with dashes, trim dashes
UPDATE public.events e
SET slug = lower(regexp_replace(coalesce(e.title, e.id::text), '[^a-z0-9]+', '-', 'g'))
WHERE e.slug IS NULL;

-- Ensure uniqueness by appending short id for duplicates
WITH dups AS (
  SELECT slug, array_agg(id) AS ids
  FROM public.events
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING count(*) > 1
)
UPDATE public.events e
SET slug = e.slug || '-' || substr(e.id::text, 1, 8)
FROM dups
WHERE e.slug = dups.slug
  AND e.id <> (SELECT min(id) FROM public.events WHERE slug = dups.slug);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON public.events(slug);


