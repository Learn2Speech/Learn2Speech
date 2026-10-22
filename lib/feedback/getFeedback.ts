import type { Transcript } from "@/lib/transcription/types";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { speechFeedbackPrompt } from "@/lib/feedback/buildPrompt";
import { requestFeedback, parseFeedback } from "@/lib/feedback/anthropic";
import type { FeedbackCall } from "@/lib/feedback/types";

export async function getFeedback(transcript: Transcript): Promise<FeedbackCall> {
  const metrics = calculateMetrics(transcript);
  const prompt = speechFeedbackPrompt(transcript, metrics);
  const replyText = await requestFeedback(prompt);
  const feedback = parseFeedback(replyText);
  return { metrics, feedback};
}