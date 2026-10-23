
-- Adds the app components derived from Rian's work
alter table recordings
add column status text default 'uploaded' check (status in ('uploaded', 'analyzing', 'done', 'failed')),
add column transcript jsonb,
add column metrics jsonb,
add column feedback jsonb,
add column duration_ms integer,
add column error_message text;


-- This rule mainly only allows for the CODE to edit the coolumn to different status levels, not the user.
-- But why is it saying the user is allowed? Because the code that is doing the editing and the user have the same markings
-- So if we give permission for users with the user id of the file to edit, the code will therefore have permission. It is a trade-off but important so that we can easily incorporate the code
create policy "Users can NOW EDIT their own audio file STATUS in the table"
on recordings
for update 
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Above unlike the other rules we use "using" AND "WITH CHECK" because for editing you need extra security
-- The using checks before to see if the code/user matches user id and with check checks after the edit too. 