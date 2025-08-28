-- Add pronunciation column to words table
ALTER TABLE public.words 
ADD COLUMN pronunciation TEXT;