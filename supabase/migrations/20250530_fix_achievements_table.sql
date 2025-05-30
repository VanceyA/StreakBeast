-- Migration: Fix achievements table structure
-- This migration adds missing columns to the achievements table

-- Add icon column if it doesn't exist
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'trophy';

-- Add category column if it doesn't exist (we already created this in another migration, but adding it here for completeness)
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create or update RLS policies
DO $$
BEGIN
    -- Check if the policy exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'achievements' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        -- Update existing policy
        ALTER POLICY "Enable read access for all users" ON public.achievements
        USING (true);
    ELSE
        -- Create new policy
        CREATE POLICY "Enable read access for all users" ON public.achievements
        FOR SELECT USING (true);
    END IF;
END
$$;
