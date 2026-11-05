-- Users used to be able to edit any column of their own recordings from the browser, including
-- "status" (reset it to re-run paid analyses) and the results. Now only the server (service_role key,
-- which ignores RLS) changes them. Users can still SELECT, INSERT and DELETE their own rows.
-- Run this AFTER the matching code is live, or analysis will fail.
drop policy if exists "Users can NOW EDIT their own audio file STATUS in the table" on recordings;

-- One row per started analysis, so the daily limit can't be reset by deleting recordings.
-- RLS is on with no policies: only the service_role key can read or write it.
create table analysis_log (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table analysis_log enable row level security;
create index analysis_log_user_day on analysis_log (user_id, created_at);
