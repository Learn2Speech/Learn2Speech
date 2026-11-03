import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
// SUMMARY: builds the instructions we send to Claude. The prompt has four parts:
//   a role (supportive speech coach), the data (transcript + our measured numbers),
//   the rules (what a normal pace is, keep it to 3-5 problems with doable tips),
//   and the exact JSON format to reply in, so parseFeedback can read the answer.
// Claude gets our calculated numbers instead of guessing them from the text.
export function speechFeedbackPrompt(transcript: Transcript, metrics: SpeechMetrics): string{
    return `You are a supportive speech coach who is meant to look at data and transcript to help the user improve their speaking skills.   
    Data: Transcript: ${transcript.text}, Words per minute: ${metrics.wordsPerMinute}, Number of fillers: ${metrics.fillerCount}, Which fillers: ${metrics.fillers.map(f => f.word).join(", ")}, Pauses: ${metrics.pauses.length}.
    Rules: Regular wpm = 130-160, Summarize feedback, Give strengths, Give only 3-5 big problems, Give reasonable/doable tips for each improvement. The transcript may contain recognition errors, especially for accented speakers, so do not criticize word choice, grammar, or pronunciation that could be a transcription mistake, and never criticize the accent itself.
    Reply with ONLY JSON like: {"summary": "...", "strengths": ["...", "..."], "improvements": [{"area": "...", "tip": "..."}]}`;
}
