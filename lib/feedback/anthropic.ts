import {UserFacingError} from "@/lib/user-error";
// SUMMARY: talks to the Anthropic (Claude) API. It has three jobs:
//   requestFeedback  - sends our prompt to Claude and returns the raw text reply
//   isCoachingFeedback - checks a parsed reply really has the fields we expect
//   parseFeedback    - turns Claude's text reply into a CoachingFeedback object
// Every failure path logs the technical reason for us and throws a friendly message for the user.
import type { CoachingFeedback, ImpromptuReview } from "@/lib/feedback/types";
export async function requestFeedback(prompt: string): Promise<string> {
  // The key only exists on the server (.env.local locally, Vercel settings online), never in the browser
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey){
    console.error("ANTHROPIC_API_KEY is missing. Add it to .env.local");
    throw new UserFacingError("Feedback isn't available right now. Please try again later.");
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
    max_tokens: 2500, // a little extra room for the impromptu section                             
    messages: [{ role: "user", content: prompt }],  
}),
  });
  // A non-OK status (bad key, no credit, rate limit...) still comes back as a normal response,
  // so fetch doesn't throw. We have to check it ourselves and log the real reason for debugging.
  if (!response.ok){
    const reason = await response.text();
    console.error(`Response failed: ${response.status} ${reason}`);
    throw new UserFacingError("We couldn't get feedback right now. Please try again.");
}
  const data: {
    content: {type: string; text?: string}[];
    stop_reason: string;
  } = await response.json();
  // stop_reason says WHY Claude stopped writing. "max_tokens" means the reply was cut off,
  // so the JSON would be incomplete and parsing it would fail.
  if (data.stop_reason === "max_tokens"){
    console.error("Stop failed! Reached max token capacity.");
    throw new UserFacingError("We couldn't get feedback right now. Please try again.");
  }
  if (data.stop_reason === "refusal"){
    console.error("Answer declined!");
    throw new UserFacingError("Claude isn't giving feedback on this recording. Try a different recording!");
  }
  // content is a list of blocks (text, tool calls...), so find the first one that is text
  const analysis = data.content.find(d => d.type === "text");
  if (analysis === undefined || analysis.text === undefined){  
    console.error("The data text has no text.");
    throw new UserFacingError("Reply came back empty. Please try again.");
  }
  return analysis.text;
}
// Claude's reply is outside our control, so we check its shape at runtime instead of trusting it.
// TypeScript can't do this for us: its types disappear when the code runs.
export function isCoachingFeedback(x: unknown): boolean {
    const obj = x as { summary?: unknown; strengths?: unknown; improvements?: unknown };
    return typeof x === "object" && x !== null
    && typeof obj.summary === "string"
    && obj.summary.length < 2000
    && Array.isArray(obj.strengths) && obj.strengths.length <= 10
    && obj.strengths.every((s) => typeof s === "string" && s.length < 1000)
    && Array.isArray(obj.improvements) && obj.improvements.length <= 10
    && obj.improvements.every((i) => {
        const item = i as { area?: unknown; tip?: unknown } | null;
        return typeof item === "object" && item !== null
        && typeof item.area === "string" && item.area.length < 300
        && typeof item.tip === "string" && item.tip.length < 1000;
    });
}
// The extra impromptu section, checked the same careful way
function isCheck(x: unknown): boolean {
    const c = x as { rating?: unknown; comment?: unknown } | null;
    return typeof c === "object" && c !== null
    && (c.rating === "strong" || c.rating === "okay" || c.rating === "weak")
    && typeof c.comment === "string" && c.comment.length < 1000;
}
export function isImpromptuReview(x: unknown): boolean {
    const r = x as { onTopic?: unknown; structure?: unknown; timeUse?: unknown } | null;
    if (typeof r !== "object" || r === null) return false;
    const s = r.structure as { opening?: unknown; mainPoints?: unknown; closing?: unknown } | null;
    return isCheck(r.onTopic) && isCheck(r.timeUse) && isCheck(s)
    && typeof s?.opening === "boolean" && typeof s?.closing === "boolean"
    && typeof s?.mainPoints === "number" && Number.isInteger(s.mainPoints) && s.mainPoints >= 0 && s.mainPoints <= 20;
}

// expectImpromptu: this was an impromptu run, so keep the "impromptu" section if it's well formed.
// If it's missing or broken we still keep the normal feedback (the speaker already paid the wait), just
// without the extra section, rather than failing the whole analysis. On normal runs it's always dropped.
export function parseFeedback(text: string, expectImpromptu = false): CoachingFeedback{
    let data: unknown;
    try{
        // Claude sometimes adds a sentence or code fences around the JSON, so we cut from the
        // first "{" to the last "}" and parse only that part.
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");       
        const jsonText = text.slice(start, end + 1);              
        if (start === -1 || end === -1){
            throw new UserFacingError("Wasn't valid JSON.");
        }
        data = JSON.parse(jsonText);
    } catch{
        // Log only the length, not the reply itself: it can quote the user's speech (privacy)
        console.error(`Claude's reply wasn't valid JSON (${text.length} characters).`);
        throw new UserFacingError("Reply was garbled. Please try again.");
    }
    if (!isCoachingFeedback(data)){
        console.error("Claude's reply was missing summary, strengths, or improvements.");
        throw new UserFacingError("Reply was garbled. Please try again.")
    }
    const {summary, strengths, improvements, impromptu} = data as CoachingFeedback;
    const feedback: CoachingFeedback = {summary, strengths, improvements};
    if (expectImpromptu) {
        if (isImpromptuReview(impromptu)) {
            const r = impromptu as ImpromptuReview;
            // copy only the fields we know about, so nothing extra from the reply gets saved
            feedback.impromptu = {
                onTopic: {rating: r.onTopic.rating, comment: r.onTopic.comment},
                structure: {rating: r.structure.rating, comment: r.structure.comment, opening: r.structure.opening, mainPoints: r.structure.mainPoints, closing: r.structure.closing},
                timeUse: {rating: r.timeUse.rating, comment: r.timeUse.comment},
            };
        } else {
            console.error("Claude's reply was missing a valid impromptu section; saving the normal feedback only.");
        }
    }
    return feedback;
}
