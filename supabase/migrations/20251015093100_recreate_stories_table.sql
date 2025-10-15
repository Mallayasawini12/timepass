-- Drop existing table and view if they exist
DROP VIEW IF EXISTS public.stories_with_profiles;
DROP TABLE IF EXISTS public.stories;

-- Create stories table
CREATE TABLE public.stories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Stories are viewable by everyone" ON stories
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own stories" ON stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON stories
    FOR DELETE USING (auth.uid() = user_id);

-- Create view with profile information
CREATE VIEW public.stories_with_profiles AS
SELECT 
    s.id,
    s.created_at,
    s.user_id,
    s.image_url,
    s.caption,
    json_build_object(
        'username', p.username,
        'avatar_url', p.avatar_url
    ) as profile
FROM public.stories s
LEFT JOIN public.profiles p ON s.user_id = p.id;