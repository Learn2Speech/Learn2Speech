-- !!! RUN THIS ONLY ON THE MAIN SUPABASE PROJECT (shhfkogdpuksejhunatd) !!!
-- !!! NEVER run it on the CAC judges' project (lkrjkuhjtabcoxhjnetu).  !!!
--
-- Impromptu mode: the speaker now picks their own length with - and + (30 seconds to 5 minutes, in
-- 15-second steps; lib/impromptu/topics.ts) instead of only 1, 2 or 3 minutes.
-- Run this BEFORE deploying the matching code. Every old value (60, 120, 180) still passes.
alter table public.recordings
  drop constraint if exists recordings_target_seconds_valid,
  add constraint recordings_target_seconds_valid
    check (target_seconds is null or (target_seconds between 30 and 300 and target_seconds % 15 = 0));
