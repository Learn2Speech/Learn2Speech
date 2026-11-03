// SUMMARY: talks to the Anthropic (Claude) API. It has three jobs:
//   requestFeedback  - sends our prompt to Claude and returns the raw text reply
//   isCoachingFeedback - checks a parsed reply really has the fields we expect
//   parseFeedback    - turns Claude's text reply into a CoachingFeedback object
// Every failure path logs the technical reason for us and throws a friendly message for the user.
import type { CoachingFeedback } from "@/lib/feedback/types";
export async function requestFeedback(prompt: string): Promise<string> {
  // The key only exists on the server (.env.local locally, Vercel settings online), never in the browser
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey){
    console.error("ANTHROPIC_API_KEY is missing. Add it to .env.local");
    throw new Error("Feedback isn't available right now. Please try again later.");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
     model: "claude-opus-5-5",
    max_tokens: 16000,                             
    messages: [{ role: "user", content: prompt }],  
}),
  });
  // A non-OK status (bad key, no credit, rate limit...) still comes back as a normal response,
  // so fetch doesn't throw. We have to check it ourselves and log the real reason for debugging.
  if (!response.ok){
    const reason = await response.text();
    console.error(`Response failed: ${response.status} ${reason}`);
    throw new Error("We couldn't get feedback right now. Please try again.");
}
  const data: {
    content: {type: string; text?: string}[];
    stop_reason: string;
  } = await response.json();
  // stop_reason says WHY Claude stopped writing. "max_tokens" means the reply was cut off,
  // so the JSON would be incomplete and parsing it would fail.
  if (data.stop_reason === "max_tokens"){
    console.error("Stop failed! Reached max token capacity.");
    throw new Error("We couldn't get feedback right now. Please try again.");
  }
  if (data.stop_reason === "refusal"){
    console.error("Answer declined!");
    throw new Error("Claude isn't giving feedback on this recording. Try a different recording!");
  }
  // content is a list of blocks (text, tool calls...), so find the first one that is text
  const analysis = data.content.find(d => d.type === "text");
  if (analysis === undefined || analysis.text === undefined){  
    console.error("The data text has no text.");
    throw new Error("Reply came back empty. Please try again.");
  }
  return analysis.text;
}
// Claude's reply is outside our control, so we check its shape at runtime instead of trusting it.
// TypeScript can't do this for us: its types disappear when the code runs.
export function isCoachingFeedback(x: unknown): boolean {
    const obj = x as { summary?: unknown; strengths?: unknown; improvements?: unknown };
    return typeof x === "object" && x !== null
    && typeof obj.summary === "string"
    && Array.isArray(obj.improvements)
    && Array.isArray(obj.strengths);
}
export function parseFeedback(text: string): CoachingFeedback{
    let data: unknown;
    try{
        // Claude sometimes adds a sentence or code fences around the JSON, so we cut from the
        // first "{" to the last "}" and parse only that part.
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");       
        const jsonText = text.slice(start, end + 1);              
        if (start === -1 || end === -1){
            throw new Error("Wasn't valid JSON.");
        }
        data = JSON.parse(jsonText);
    } catch{
        // Log only the length, not the reply itself: it can quote the user's speech (privacy)
        console.error(`Claude's reply wasn't valid JSON (${text.length} characters).`);
        throw new Error("Reply was garbled. Please try again.");
    }
    if (!isCoachingFeedback(data)){
        console.error("Claude's reply was missing summary, strengths, or improvements.");
        throw new Error("Reply was garbled. Please try again.")
    }
    return data as CoachingFeedback;
}
