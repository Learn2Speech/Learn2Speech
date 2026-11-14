-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Fixes "infinite recursion detected in policy for relation recordings" when adding a recording.
-- The "at most 200 recordings per user" check (0005, rewritten in 0007) counted rows of recordings from
-- inside a rule ON recordings, so Postgres refused it. The count now runs in a small helper function
-- that skips the rules (security definer) and only ever counts the caller's own rows.
-- Same rule as before: you may only add rows for yourself, and only while you have fewer than 200.

-- A schema the website's API doesn't expose, so the helper can't be called from the browser directly.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.recordings_under_limit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 200 from public.recordings where user_id = (select auth.uid());
$$;

revoke execute on function private.recordings_under_limit() from public, anon;
grant execute on function private.recordings_under_limit() to authenticated;

alter policy "Users can ADD with their OWN audio file names in the table" on public.recordings
  with check (
    user_id = (select auth.uid())
    and (select private.recordings_under_limit())
  );
