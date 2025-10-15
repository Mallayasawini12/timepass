-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Allow public access to view avatars
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatar images
create policy "Users can upload avatar images"
on storage.objects for insert
with check (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
);

-- Allow users to update their own avatar images
create policy "Users can update own avatar images"
on storage.objects for update
using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
);

-- Allow users to delete their own avatar images
create policy "Users can delete own avatar images"
on storage.objects for delete
using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
);