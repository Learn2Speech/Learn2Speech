import type { Transcript } from "@/lib/transcription/types";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { speechFeedbackPrompt } from "@/lib/feedback/buildPrompt";
import { requestFeedback, parseFeedback } from "@/lib/feedback/anthropic";
import type { FeedbackCall } from "@/lib/feedback/types";
import { rateTimeUse, type ImpromptuInfo } from "@/lib/impromptu/topics";

// SUMMARY: the feedback pipeline in four steps: measure the transcript, build the prompt from it,
// ask Claude, then parse the reply. Returns both the metrics and the feedback so they are
// saved together and always match each other.
// For an impromptu run (topic + target length), the feedback also judges topic, structure and timing.
export async function getFeedback(transcript: Transcript, impromptu?: ImpromptuInfo | null): Promise<FeedbackCall> {
  const metrics = calculateMetrics(transcript);
  const prompt = speechFeedbackPrompt(transcript, metrics, impromptu);
  const replyText = await requestFeedback(prompt);
  const feedback = parseFeedback(replyText, Boolean(impromptu));
  // the time rating is decided in code, so make sure the saved one is ours even if Claude changed it
  if (impromptu && feedback.impromptu) {
    feedback.impromptu.timeUse.rating = rateTimeUse(transcript.durationMs / 1000, impromptu.targetSeconds);
  }
  return { metrics, feedback};
}