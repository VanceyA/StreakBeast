-- Migration: Add category column to achievements table
-- This migration adds a category column to the achievements table

-- Add category column to achievements table if it doesn't exist
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Update RLS policies to include category
ALTER POLICY "Enable read access for all users" ON public.achievements
USING (true);
