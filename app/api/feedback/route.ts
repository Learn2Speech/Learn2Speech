// file: app/api/feedback/route.ts  →  URL: /api/feedback
// Takes a Transcript (from /api/transcribe) and returns its metrics plus Claude's
// coaching feedback. Kept separate from transcription so a failed feedback call
// can be retried without paying to transcribe the audio again.
import type { Transcript } from "@/lib/transcription/types";
import { getFeedback } from "@/lib/feedback/getFeedback";
import { createServerSupabase } from "@/lib/supabase-server";

// Claude thinks before answering, so give it more than the default time limit.
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in or sign up to get feedback." }, { status: 401 });
  }
  const body: { transcript?: Partial<Transcript> } = await request.json();
  const transcript = body.transcript;

  // Check the shape before doing any math, so bad input gets a clear 400
  // instead of crashing inside calculateMetrics.
  if (
    !transcript ||
    typeof transcript.text !== "string" ||
    !Array.isArray(transcript.words) ||
    typeof transcript.durationMs !== "number"
  ) {
    return Response.json({ error: "transcript with text, words and durationMs is required" }, { status: 400 });
  }

  try {
    const result = await getFeedback(transcript as Transcript);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
