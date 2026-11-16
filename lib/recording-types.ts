// Shape of one row in the `recordings` table, including the columns added in
// migration 0003. The History page, the upload page and the analyze route all
// read these rows, so they share this one description.
import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { CoachingFeedback } from "@/lib/feedback/types";

// The analyze route is stopped after 200 seconds (its maxDuration), so a row still "analyzing" after this
// long is dead: the route may claim it again, and the results page offers "Try again".
export const STALE_ANALYSIS_MS = 4 * 60 * 1000;
export const isStuck = (row: Pick<Recording, "status" | "analysis_started_at">) =>
  row.status === "analyzing" && Date.now() - new Date(row.analysis_started_at ?? 0).getTime() > STALE_ANALYSIS_MS;

// Must match the `check` on the status column in 0003_recordings_results.sql.
export type RecordingStatus = "uploaded" | "analyzing" | "done" | "failed";

export type Recording = {
  id: string;
  user_id: string;
  file_path: string;
  original_name: string;
  size_bytes: number;
  created_at: string; // the database sends timestamps as text

  status: RecordingStatus;
  // null until the analysis finishes (and stays null if it fails)
  transcript: Transcript | null;
  metrics: SpeechMetrics | null;
  feedback: CoachingFeedback | null;
  duration_ms: number | null;
  error_message: string | null; // only filled in when status is "failed"
  analysis_started_at: string | null; // when the latest analysis began (migration 0005)

  // impromptu runs only (migration 0008): the topic from lib/impromptu/topics.ts and the target
  // length in seconds (60, 120 or 180). Both null for normal recordings and uploads.
  topic: string | null;
  target_seconds: number | null;
};
