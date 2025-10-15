-- Drop existing bucket if it exists
DO $$
BEGIN
    -- Delete existing policies
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own avatar images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own avatar images" ON storage.objects;
    
    -- Delete bucket if exists
    DELETE FROM storage.buckets WHERE id = 'avatars';
END $$;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatar images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid() = owner
);

CREATE POLICY "Users can delete own avatar images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid() = owner
);