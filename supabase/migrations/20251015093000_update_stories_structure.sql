-- Add caption column to stories table
ALTER TABLE public.stories
ADD COLUMN caption text;

-- Add relationship to profiles
ALTER TABLE public.stories
ADD CONSTRAINT stories_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create view for stories with profile information
CREATE OR REPLACE VIEW public.stories_with_profiles AS
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