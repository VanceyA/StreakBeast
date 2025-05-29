-- supabase/migrations/20250529_create_social_connections.sql
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(user_id, provider)
);

-- Add RLS policies
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social connections"
ON public.social_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social connections"
ON public.social_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections"
ON public.social_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections"
ON public.social_connections FOR DELETE
USING (auth.uid() = user_id);

-- Create content suggestions table
CREATE TABLE IF NOT EXISTS public.content_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    suggestions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, created_at)
);

-- Add RLS policies for content suggestions
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content suggestions"
ON public.content_suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content suggestions"
ON public.content_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content suggestions"
ON public.content_suggestions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content suggestions"
ON public.content_suggestions FOR DELETE
USING (auth.uid() = user_id);

-- Create user dashboard widgets table
CREATE TABLE IF NOT EXISTS public.user_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add RLS policies for user widgets
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widgets"
ON public.user_widgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widgets"
ON public.user_widgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
ON public.user_widgets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
ON public.user_widgets FOR DELETE
USING (auth.uid() = user_id);