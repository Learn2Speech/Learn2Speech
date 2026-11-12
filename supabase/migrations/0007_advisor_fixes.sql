-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Fixes from Supabase's security and performance advisors. Nothing about who can see or change what
-- is different: the rules below say exactly the same thing, just in the faster form.

-- 1) rls_auto_enable is Supabase's helper that switches on Row Level Security for every new table. It runs
--    by itself (an event trigger) when a table is created, so nobody needs to call it through the API.
--    Take away the API's permission to call it directly.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 2) An index on recordings.user_id, so "my recordings" stays fast as the table grows.
create index if not exists recordings_user_id_idx on public.recordings (user_id);

-- 3) Same rules, written with (select auth.uid()) so Postgres works out "who is asking" once per query
--    instead of once per row.
alter policy "Users can SEE their own audio file names in the table" on public.recordings
  using (user_id = (select auth.uid()));

alter policy "Users can DELETE audio file names in the table" on public.recordings
  using (user_id = (select auth.uid()));

alter policy "Users can ADD with their OWN audio file names in the table" on public.recordings
  with check (
    user_id = (select auth.uid())
    and (select count(*) from public.recordings r where r.user_id = (select auth.uid())) < 200
  );
