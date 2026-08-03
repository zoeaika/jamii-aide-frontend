-- Add fields required by landing-page waitlist form updates.
-- Safe to run multiple times.

ALTER TABLE public.waitlist_signups
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.waitlist_signups
ADD COLUMN IF NOT EXISTS accepts_promotional BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.waitlist_signups
SET phone = ''
WHERE phone IS NULL;

ALTER TABLE public.waitlist_signups
ALTER COLUMN phone SET NOT NULL;
