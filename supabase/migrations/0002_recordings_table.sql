create table recordings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade, 
    file_path text not null,
    original_name text not null,
    size_bytes bigint not null,
    created_at timestamptz not null default now()
);

alter table recordings enable row level security;

create policy "Users can SEE their own audio file names in the table"
on recordings
for select 
to authenticated
using (user_id = auth.uid());

create policy "Users can ADD with their OWN audio file names in the table"
on recordings
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can DELETE audio file names in the table"
on recordings
for delete
to authenticated
using (user_id = auth.uid());