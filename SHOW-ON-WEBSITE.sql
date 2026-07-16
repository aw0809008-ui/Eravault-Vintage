-- Run once in the Supabase SQL editor.
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS show_on_website BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS inventory_show_on_website_idx
ON public.inventory (show_on_website)
WHERE show_on_website = true;
