-- Run this BEFORE deploying the matching code (it only adds things, so the old code keeps working).

-- 1) When an analysis was claimed, so a stuck "analyzing" row can be retried 10 minutes after THAT.
alter table recordings add column if not exists analysis_started_at timestamptz;

-- 2) On INSERT, users may only set these four columns. status, transcript, metrics, feedback, id and
--    created_at now come from the defaults, so nobody can create a fake "done" recording.
revoke insert on recordings from authenticated;
grant insert (user_id, file_path, original_name, size_bytes) on recordings to authenticated;
alter table recordings alter column status set not null;

-- 3) Sanity limits: file name length, and at most 200 recordings per user (storage quota).
alter table recordings add constraint recordings_original_name_len check (length(original_name) <= 200);
drop policy "Users can ADD with their OWN audio file names in the table" on recordings;
create policy "Users can ADD with their OWN audio file names in the table"
on recordings
for insert
to authenticated
with check (user_id = auth.uid() and (select count(*) from recordings r where r.user_id = auth.uid()) < 200);
