create table public.stories (
    id uuid not null default uuid_generate_v4(),
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    user_id uuid references auth.users not null,
    image_url text not null,

    constraint stories_pkey primary key (id)
);

alter table public.stories enable row level security;

create policy "Stories are viewable by everyone" on stories
    for select using (true);

create policy "Users can create their own stories" on stories
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own stories" on stories
    for delete using (auth.uid() = user_id);

-- Create storage bucket for stories media
insert into storage.buckets (id, name)
values ('media', 'media')
on conflict do nothing;

-- Set up storage policies
create policy "Media are publicly accessible"
on storage.objects for select
using ( bucket_id = 'media' );

create policy "Authenticated users can upload media"
on storage.objects for insert
with check ( bucket_id = 'media' AND auth.role() = 'authenticated' );

create policy "Users can delete their own media"
on storage.objects for delete
using ( bucket_id = 'media' AND auth.uid() = owner );