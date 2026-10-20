// file: app/api/feedback/route.ts  →  URL: /api/feedback
// Takes a Transcript (from /api/transcribe) and returns its metrics plus Claude's
// coaching feedback. Kept separate from transcription so a failed feedback call
// can be retried without paying to transcribe the audio again.
import type { Transcript } from "@/lib/transcription/types";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { speechFeedbackPrompt } from "@/lib/feedback/buildPrompt";
import { requestFeedback, parseFeedback } from "@/lib/feedback/anthropic";

// Claude thinks before answering, so give it more than the default time limit.
export const maxDuration = 60;

export async function POST(request: Request) {
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
    const metrics = calculateMetrics(transcript as Transcript);
    const prompt = speechFeedbackPrompt(transcript as Transcript, metrics);
    const replyText = await requestFeedback(prompt);
    const feedback = parseFeedback(replyText);
    return Response.json({ metrics, feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
