import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
export function speechFeedbackPrompt(transcript: Transcript, metrics: SpeechMetrics): string{
    return `You are a supportive speech coach who is meant to look at data and transcript to help the user improve their speaking skills.   
    Data: Transcript: ${transcript.text}, Words per minute: ${metrics.wordsPerMinute}, Number of fillers: ${metrics.fillerCount}, Which fillers: ${metrics.fillers.map(f => f.word).join(", ")}, Pauses: ${metrics.pauses.length}.
    Rules: Regular wpm = 130-160, Summarize feedback, Give strengths, Give only 3-5 big problems, Give reasonable/doable tips for each improvement. 
    Reply with ONLY JSON like: {"summary": "...", "strengths": ["...", "..."], "improvements": [{"area": "...", "tip": "..."}]}`;
}
