-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Rename a recording (History and results pages). Until now nobody could update a row from the app (no
-- UPDATE policy), which kept scores and feedback safe. This allows exactly one thing: a signed-in user
-- changing the NAME of their OWN recordings. Every other column stays read-only for them (the analyze
-- route writes results with the service role, which this doesn't touch).
revoke update on public.recordings from anon, authenticated;
grant update (original_name) on public.recordings to authenticated;

create policy "Users can RENAME their own recordings" on public.recordings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- the name is still capped at 200 characters by recordings_original_name_len
