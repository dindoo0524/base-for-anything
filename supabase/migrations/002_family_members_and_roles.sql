-- v2.0: 가족 회원 프로필과 역할별 권한
-- 001_create_entries.sql을 먼저 실행한 뒤 이 파일 전체를 실행합니다.

create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Family members can read profiles" on public.profiles;
create policy "Family members can read profiles"
on public.profiles
for select
to authenticated
using (true);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      '가족'
    ),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- v1.0에서 이미 만든 계정도 가족 프로필로 등록합니다.
insert into public.profiles (id, display_name, role)
select
  id,
  coalesce(
    nullif(btrim(raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(email, ''), '@', 1), ''),
    '가족'
  ),
  'member'
from auth.users
on conflict (id) do nothing;

create or replace function private.is_family_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_family_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_family_admin() to authenticated;

-- v1.0의 공개 조회 정책을 가족 로그인 전용 정책으로 교체합니다.
revoke all on table public.entries from anon, authenticated;
grant select, insert, update, delete on table public.entries to authenticated;

drop policy if exists "Anyone can read entries" on public.entries;
drop policy if exists "Users can create their own entries" on public.entries;
drop policy if exists "Users can update their own entries" on public.entries;
drop policy if exists "Users can delete their own entries" on public.entries;
drop policy if exists "Family members can read entries" on public.entries;
drop policy if exists "Family members can create entries" on public.entries;
drop policy if exists "Members can update their own entries" on public.entries;
drop policy if exists "Members delete own or admins delete any entry" on public.entries;

create policy "Family members can read entries"
on public.entries
for select
to authenticated
using (true);

create policy "Family members can create entries"
on public.entries
for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Members can update their own entries"
on public.entries
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Members delete own or admins delete any entry"
on public.entries
for delete
to authenticated
using (
  (select auth.uid()) = author_id
  or (select private.is_family_admin())
);

-- 실행 후 권사님 계정 이메일을 넣어 최고 권한으로 바꿉니다.
-- 아래 예시의 이메일을 실제 권사님 이메일로 바꾼 뒤 한 번만 실행하세요.
--
-- update public.profiles
-- set role = 'admin', display_name = '민숙 권사님'
-- where id = (
--   select id from auth.users where email = '권사님이메일@example.com'
-- );
