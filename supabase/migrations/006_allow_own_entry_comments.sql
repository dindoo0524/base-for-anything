drop policy if exists "Users can comment on another user's QT entry" on public.qt_comments;
drop policy if exists "Authenticated users can comment on QT entries" on public.qt_comments;

create policy "Authenticated users can comment on QT entries"
on public.qt_comments for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and parent_comment_id is null
  and exists (
    select 1
    from public.qt_entries entry
    where entry.id = entry_id
  )
);
