import type { Transcript } from "@/lib/transcription/types";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import { speechFeedbackPrompt } from "@/lib/feedback/buildPrompt";
import { requestFeedback, parseFeedback } from "@/lib/feedback/anthropic";
import type { FeedbackCall } from "@/lib/feedback/types";
import { rateTimeUse, type ImpromptuInfo } from "@/lib/impromptu/topics";
import type { TopicInfo } from "@/lib/topic/speech-types";
import { compareScript } from "@/lib/script/compare-script";

// SUMMARY: the feedback pipeline in four steps: measure the transcript, build the prompt from it,
// ask Claude, then parse the reply. Returns both the metrics and the feedback so they are
// saved together and always match each other.
// Optional extras (an impromptu run has its own topic, so a typed topic or script is ignored on one):
//   impromptu - also judges topic, structure and timing
//   topic     - a typed topic: pace target and tips tuned to it (lib/topic)
//   script    - a pasted script: compared with what was said, in code, plus Claude's comment (lib/script)
export type FeedbackExtras = {
  impromptu?: ImpromptuInfo | null;
  topic?: TopicInfo | null;
  script?: string | null; // already cleaned by the analyze route
  signal?: AbortSignal; // stops the Claude call when the route runs out of time
};

export async function getFeedback(transcript: Transcript, extras: FeedbackExtras = {}): Promise<FeedbackCall> {
  const impromptu = extras.impromptu ?? null;
  const topic = impromptu ? null : extras.topic ?? null;
  const scriptText = impromptu ? null : extras.script ?? null;
  const metrics = calculateMetrics(transcript);
  const comparison = scriptText ? compareScript(scriptText, transcript.words) : null;
  const prompt = speechFeedbackPrompt(transcript, metrics, { impromptu, topic, script: comparison });
  const replyText = await requestFeedback(prompt, { signal: extras.signal });
  const feedback = parseFeedback(replyText, Boolean(impromptu), topic, comparison && scriptText ? { ...comparison, text: scriptText } : null);
  // the time rating is decided in code, so make sure the saved one is ours even if Claude changed it
  if (impromptu && feedback.impromptu) {
    feedback.impromptu.timeUse.rating = rateTimeUse(transcript.durationMs / 1000, impromptu.targetSeconds);
  }
  return { metrics, feedback};
}
