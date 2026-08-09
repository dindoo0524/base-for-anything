create extension if not exists pgcrypto;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  author_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_created_at_idx
  on public.entries (created_at desc);

create index if not exists entries_author_id_idx
  on public.entries (author_id);

create or replace function public.set_entries_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_entries_updated_at on public.entries;
create trigger set_entries_updated_at
before update on public.entries
for each row execute function public.set_entries_updated_at();

alter table public.entries enable row level security;

revoke all on table public.entries from anon, authenticated;
grant select on table public.entries to anon, authenticated;
grant insert, update, delete on table public.entries to authenticated;

drop policy if exists "Anyone can read entries" on public.entries;
create policy "Anyone can read entries"
on public.entries
for select
to anon, authenticated
using (true);

drop policy if exists "Users can create their own entries" on public.entries;
create policy "Users can create their own entries"
on public.entries
for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "Users can update their own entries" on public.entries;
create policy "Users can update their own entries"
on public.entries
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists "Users can delete their own entries" on public.entries;
create policy "Users can delete their own entries"
on public.entries
for delete
to authenticated
using ((select auth.uid()) = author_id);
