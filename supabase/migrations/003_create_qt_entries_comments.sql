create table if not exists public.qt_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  scripture text not null check (char_length(btrim(scripture)) between 1 and 50),
  reflection text not null check (char_length(reflection) between 50 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, entry_date)
);
create table if not exists public.qt_comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.qt_entries(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.qt_comments(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists qt_entries_date_idx on public.qt_entries (entry_date desc);
create index if not exists qt_comments_entry_idx on public.qt_comments (entry_id, created_at);
create unique index if not exists qt_comments_one_reply_per_parent_idx
  on public.qt_comments (parent_comment_id)
  where parent_comment_id is not null;

create or replace function public.set_qt_entry_updated_at()
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

drop trigger if exists set_qt_entry_updated_at on public.qt_entries;
create trigger set_qt_entry_updated_at
before update on public.qt_entries
for each row execute function public.set_qt_entry_updated_at();

alter table public.qt_entries enable row level security;
alter table public.qt_comments enable row level security;

revoke all on table public.qt_entries from anon, authenticated;
revoke all on table public.qt_comments from anon, authenticated;
grant select, insert, update on table public.qt_entries to authenticated;
grant select, insert on table public.qt_comments to authenticated;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Authenticated users can view QT entries"
on public.qt_entries for select
to authenticated
using (true);

create policy "Users can create their own QT entries"
on public.qt_entries for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Users can update their own QT entries"
on public.qt_entries for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Authenticated users can view QT comments"
on public.qt_comments for select
to authenticated
using (true);

create policy "Users can comment on another user's QT entry"
on public.qt_comments for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and parent_comment_id is null
  and exists (
    select 1 from public.qt_entries entry
    where entry.id = entry_id
      and entry.author_id <> (select auth.uid())
  )
);

create policy "QT authors can reply once to a top-level comment"
on public.qt_comments for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and parent_comment_id is not null
  and exists (
    select 1
    from public.qt_comments parent
    join public.qt_entries entry on entry.id = parent.entry_id
    where parent.id = parent_comment_id
      and parent.entry_id = entry_id
      and parent.parent_comment_id is null
      and parent.author_id <> (select auth.uid())
      and entry.author_id = (select auth.uid())
  )
);
