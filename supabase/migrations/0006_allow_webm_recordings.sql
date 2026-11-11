-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Lets the private "recordings" bucket accept WebM audio, which is what Firefox records
-- on the Record page. Every type that was allowed before is still allowed.
update storage.buckets
set allowed_mime_types = array['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm']
where id = 'recordings';
