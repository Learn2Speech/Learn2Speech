-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- A per-user storage cap. The upload rule from 0001 only checked the folder, so someone calling Supabase
-- directly (not through the app) could upload 50 MB files with no database row and fill the whole bucket,
-- and then uploads fail for everyone. Now an upload is only allowed while the user's folder holds fewer
-- than 200 files (the same limit as recordings, 0005) and less than 300 MB.
-- The check counts files already uploaded, so the last allowed upload can go over by one file (50 MB max).
-- Same pattern as 0009: the counting runs in a security definer helper, because a rule on storage.objects
-- that reads storage.objects would check its own rules again.

create or replace function private.storage_under_quota()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 200 and coalesce(sum((metadata->>'size')::bigint), 0) < 300 * 1024 * 1024
  from storage.objects
  where bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text;
$$;

revoke execute on function private.storage_under_quota() from public, anon;
grant execute on function private.storage_under_quota() to authenticated;

alter policy "Users are able to upload audio (add new components to the bucket)" on storage.objects
  with check (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.storage_under_quota())
  );
