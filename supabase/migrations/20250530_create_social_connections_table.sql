-- Migration: Create social_connections table if it doesn't exist
-- This migration creates the social_connections table if it doesn't exist

-- Check if the table exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'social_connections'
    ) THEN
        -- Create the social_connections table
        CREATE TABLE public.social_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            provider TEXT NOT NULL,
            provider_user_id TEXT NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TIMESTAMP WITH TIME ZONE,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE (user_id, provider)
        );

        -- Add RLS policies
        ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for users to view their own connections
        CREATE POLICY "Users can view their own connections" ON public.social_connections
            FOR SELECT USING (auth.uid() = user_id);
            
        -- Create policy for users to insert their own connections
        CREATE POLICY "Users can insert their own connections" ON public.social_connections
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        -- Create policy for users to update their own connections
        CREATE POLICY "Users can update their own connections" ON public.social_connections
            FOR UPDATE USING (auth.uid() = user_id);
            
        -- Create policy for users to delete their own connections
        CREATE POLICY "Users can delete their own connections" ON public.social_connections
            FOR DELETE USING (auth.uid() = user_id);
            
        -- Grant access to authenticated users
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_connections TO authenticated;
        
        -- Create index on user_id
        CREATE INDEX social_connections_user_id_idx ON public.social_connections (user_id);
        
        -- Create index on provider
        CREATE INDEX social_connections_provider_idx ON public.social_connections (provider);
    END IF;
END
$$;
