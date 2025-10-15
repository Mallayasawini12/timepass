-- Create stories table
create table if not exists public.stories (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    image_url text not null,
    caption text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint stories_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.stories enable row level security;

-- Create stories_with_profiles view
create or replace view public.stories_with_profiles as
select 
    s.*,
    p.username,
    p.avatar_url
from public.stories s
join public.profiles p on s.user_id = p.id;

-- Create policies
create policy "Stories are viewable by everyone" on stories
    for select using (true);

create policy "Users can create their own stories" on stories
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own stories" on stories
    for update using (auth.uid() = user_id);

create policy "Users can delete their own stories" on stories
    for delete using (auth.uid() = user_id);

-- Add indexes
create index stories_user_id_idx on public.stories(user_id);
create index stories_created_at_idx on public.stories(created_at desc);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.stories to authenticated;
grant select on public.stories_with_profiles to authenticated;