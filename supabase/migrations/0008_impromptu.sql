-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Impromptu mode: a recording can carry the topic it was about and how long the speech was meant to be.
-- Both stay empty (null) for normal recordings and uploads.
-- Run this BEFORE deploying the matching code. It only adds things, so the old code keeps working.

alter table public.recordings
  add column if not exists topic text,
  add column if not exists target_seconds integer;

-- Sanity limits: a short topic, a 1, 2 or 3 minute target, and either both filled in or neither.
alter table public.recordings
  add constraint recordings_topic_len check (topic is null or length(topic) <= 200),
  add constraint recordings_target_seconds_valid check (target_seconds is null or target_seconds in (60, 120, 180)),
  add constraint recordings_impromptu_both check ((topic is null) = (target_seconds is null));

-- Migration 0005 lets users fill in only four columns when they add a recording. Add these two.
-- (The analyze route still only trusts topics that are on the app's built-in list.)
grant insert (topic, target_seconds) on public.recordings to authenticated;
