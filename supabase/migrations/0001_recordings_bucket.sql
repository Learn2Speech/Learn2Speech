-- The bucket will probably be called supabase recording storage. or storagge.
-- It is going to be private, because this is going to be storing everybodys possible audio uploads. The only way we extract audio uploads from this to reshow to the user is through finding user id
-- The limits i dont know
-- allowed only if user of the perosn trying ot od the action equals the user id of the upload, since the bucket contianing the audios are a huge datavse
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('recordings', 'recordings', false, 52428800, array['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']);

create policy "Users are able to access and read recordings (access components in the bucket)" 
on storage.objects 
for select 
to authenticated
using (bucket_id = 'recordings' and ((storage.foldername(name))[1] = auth.uid()::text));

create policy "Users are able to upload audio (add new components to the bucket)"
on storage.objects
for insert
to authenticated
with check ( bucket_id = 'recordings' and ((storage.foldername(name))[1] = auth.uid()::text));

create policy "Users are able to access and DELETE audio"
on storage.objects
for delete
to authenticated
using (bucket_id = 'recordings' and ((storage.foldername(name))[1] = auth.uid()::text));
