import type { Transcript } from "@/lib/transcription/types";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { speechFeedbackPrompt } from "@/lib/feedback/buildPrompt";
import { requestFeedback, parseFeedback } from "@/lib/feedback/anthropic";
import type { FeedbackCall } from "@/lib/feedback/types";

// SUMMARY: the feedback pipeline in four steps: measure the transcript, build the prompt from it,
// ask Claude, then parse the reply. Returns both the metrics and the feedback so they are
// saved together and always match each other.
export async function getFeedback(transcript: Transcript): Promise<FeedbackCall> {
  const metrics = calculateMetrics(transcript);
  const prompt = speechFeedbackPrompt(transcript, metrics);
  const replyText = await requestFeedback(prompt);
  const feedback = parseFeedback(replyText);
  return { metrics, feedback};
}