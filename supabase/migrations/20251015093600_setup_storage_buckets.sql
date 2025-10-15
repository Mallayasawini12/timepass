-- Drop existing buckets if they exist
DO $$
BEGIN
    DELETE FROM storage.buckets WHERE id IN ('avatars', 'stories');
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;
    
    DROP POLICY IF EXISTS "Story public access" ON storage.objects;
    DROP POLICY IF EXISTS "Story insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Story update access" ON storage.objects;
    DROP POLICY IF EXISTS "Story delete access" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('stories', 'stories', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']);

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

-- Create policies for stories
CREATE POLICY "Story public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Story insert access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'stories' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Story update access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'stories' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);

CREATE POLICY "Story delete access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'stories' 
    AND auth.role() = 'authenticated' 
    AND owner = auth.uid()
);