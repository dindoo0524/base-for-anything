insert into public.profiles (id, nickname)
select
  user_record.id,
  left(
    coalesce(
      nullif(btrim(user_record.raw_user_meta_data ->> 'nickname'), ''),
      nullif(split_part(user_record.email, '@', 1), ''),
      'Hunter'
    ),
    20
  )
from auth.users as user_record
where not exists (
  select 1
  from public.profiles as profile
  where profile.id = user_record.id
);
