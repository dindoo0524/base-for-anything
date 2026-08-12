create table if not exists public.daily_scriptures (
  reading_date date primary key,
  scripture text not null check (char_length(btrim(scripture)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_daily_scripture_updated_at()
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

drop trigger if exists set_daily_scripture_updated_at on public.daily_scriptures;
create trigger set_daily_scripture_updated_at
before update on public.daily_scriptures
for each row execute function public.set_daily_scripture_updated_at();

alter table public.daily_scriptures enable row level security;

revoke all on table public.daily_scriptures from anon, authenticated;
grant select on table public.daily_scriptures to authenticated;

drop policy if exists "Authenticated users can view daily scriptures" on public.daily_scriptures;
create policy "Authenticated users can view daily scriptures"
on public.daily_scriptures for select
to authenticated
using (true);

insert into public.daily_scriptures (reading_date, scripture)
values
  ('2026-08-01', '겔 34:1~10'),
  ('2026-08-02', '겔 34:11~24'),
  ('2026-08-03', '겔 34:25~31'),
  ('2026-08-04', '겔 35:1~15'),
  ('2026-08-05', '겔 36:1~15'),
  ('2026-08-06', '겔 36:16~31'),
  ('2026-08-07', '겔 36:32~38'),
  ('2026-08-08', '겔 37:1~14'),
  ('2026-08-09', '겔 37:15~28'),
  ('2026-08-10', '겔 38:1~13'),
  ('2026-08-11', '겔 38:14~23'),
  ('2026-08-12', '겔 39:1~10'),
  ('2026-08-13', '겔 39:11~20'),
  ('2026-08-14', '겔 39:21~29'),
  ('2026-08-15', '겔 40:1~16'),
  ('2026-08-16', '겔 40:17~49'),
  ('2026-08-17', '겔 41:1~26'),
  ('2026-08-18', '겔 42:1~20'),
  ('2026-08-19', '겔 43:1~12'),
  ('2026-08-20', '겔 43:13~27'),
  ('2026-08-21', '겔 44:1~14'),
  ('2026-08-22', '겔 44:15~31'),
  ('2026-08-23', '겔 45:1~8'),
  ('2026-08-24', '겔 45:9~25'),
  ('2026-08-25', '겔 46:1~15'),
  ('2026-08-26', '겔 46:16~24'),
  ('2026-08-27', '겔 47:1~12'),
  ('2026-08-28', '겔 47:13~23'),
  ('2026-08-29', '겔 48:1~14'),
  ('2026-08-30', '겔 48:15~22'),
  ('2026-08-31', '겔 48:23~35'),
  ('2026-09-01', '시 119:1~16'),
  ('2026-09-02', '시 119:17~32'),
  ('2026-09-03', '시 119:33~48'),
  ('2026-09-04', '시 119:49~64'),
  ('2026-09-05', '시 119:65~72'),
  ('2026-09-06', '시 119:73~88'),
  ('2026-09-07', '시 119:89~104'),
  ('2026-09-08', '시 119:105~120'),
  ('2026-09-09', '시 119:121~136'),
  ('2026-09-10', '시 119:137~152'),
  ('2026-09-11', '시 119:153~168'),
  ('2026-09-12', '시 119:169~176'),
  ('2026-09-13', '대상 1~3장'),
  ('2026-09-14', '대상 4~6장'),
  ('2026-09-15', '대상 7:1~9:34'),
  ('2026-09-16', '대상 9:35~10:14'),
  ('2026-09-17', '대상 11:1~9'),
  ('2026-09-18', '대상 11:10~19'),
  ('2026-09-19', '대상 11:20~47'),
  ('2026-09-20', '대상 12:1~22'),
  ('2026-09-21', '대상 12:23~40'),
  ('2026-09-22', '대상 13:1~8'),
  ('2026-09-23', '대상 13:9~14'),
  ('2026-09-24', '대상 14:1~17'),
  ('2026-09-25', '대상 15:1~15'),
  ('2026-09-26', '대상 15:16~29'),
  ('2026-09-27', '대상 16:1~6'),
  ('2026-09-28', '대상 16:7~22'),
  ('2026-09-29', '대상 16:23~36'),
  ('2026-09-30', '대상 16:37~43')
on conflict (reading_date) do update
set scripture = excluded.scripture;
