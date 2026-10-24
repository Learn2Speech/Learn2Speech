// Shape of one row in the `recordings` table, including the columns added in
// migration 0003. The History page, the upload page and the analyze route all
// read these rows, so they share this one description.
import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { CoachingFeedback } from "@/lib/feedback/types";

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
};
