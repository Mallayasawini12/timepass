-- Drop existing buckets if they exist
DO $$
BEGIN
    DELETE FROM storage.buckets WHERE id IN ('avatars', 'media', 'posts');
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;
    
    DROP POLICY IF EXISTS "Media public access" ON storage.objects;
    DROP POLICY IF EXISTS "Media insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Media update access" ON storage.objects;
    DROP POLICY IF EXISTS "Media delete access" ON storage.objects;
    
    DROP POLICY IF EXISTS "Post public access" ON storage.objects;
    DROP POLICY IF EXISTS "Post insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Post update access" ON storage.objects;
    DROP POLICY IF EXISTS "Post delete access" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('media', 'media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']),
    ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for avatars
CREATE POLICY "Avatar public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Avatar insert access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Avatar update access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

CREATE POLICY "Avatar delete access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

-- Create policies for media (stories)
CREATE POLICY "Media public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Media insert access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Media update access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

CREATE POLICY "Media delete access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

-- Create policies for posts
CREATE POLICY "Post public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

CREATE POLICY "Post insert access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'posts' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Post update access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'posts' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

CREATE POLICY "Post delete access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'posts' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);