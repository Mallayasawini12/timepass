-- Update stories table with caption
alter table public.stories
add column caption text;

-- Ensure RLS policies are updated
drop policy if exists "Stories are viewable by everyone" on stories;
drop policy if exists "Users can create their own stories" on stories;
drop policy if exists "Users can delete their own stories" on stories;

create policy "Stories are viewable by everyone" 
on stories for select 
using (true);

create policy "Users can create their own stories" 
on stories for insert 
with check (auth.uid() = user_id);

create policy "Users can delete their own stories" 
on stories for delete 
using (auth.uid() = user_id);

-- Add foreign key constraints if not exists
do $$ 
begin
  if not exists (
    select 1 
    from information_schema.table_constraints 
    where constraint_name = 'stories_user_id_fkey'
  ) then
    alter table public.stories
    add constraint stories_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;
  end if;
end $$;