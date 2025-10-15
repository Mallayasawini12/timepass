-- First, clean up any existing avatars bucket and policies
DO $$
BEGIN
    DELETE FROM storage.buckets WHERE id = 'avatars';
    
    DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar insert access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
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