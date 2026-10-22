import type { CoachingFeedback } from "@/lib/feedback/types";
export async function requestFeedback(prompt: string): Promise<string> {
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
  if (!response.ok){
    const reason = await response.text();                      
    console.error(`Response failed: ${response.status} ${reason}`);
    throw new Error("We couldn't get feedback right now. Please try again.");
}
  const data: {
    content: {type: string; text?: string}[];
    stop_reason: string;
  } = await response.json();
  if (data.stop_reason === "max_tokens"){
    console.error("Stop failed! Reached max token capacity.");
    throw new Error("We couldn't get feedback right now. Please try again.");
  }
  if (data.stop_reason === "refusal"){
    console.error("Answer declined!");
    throw new Error("Claude isn't giving feedback on this recording. Try a different recording!");
  }
  const analysis = data.content.find(d => d.type === "text");
  if (analysis === undefined || analysis.text === undefined){  
    console.error("The data text has no text.");
    throw new Error("Reply came back empty. Please try again.");
  }
  return analysis.text;
}
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
        const start = text.indexOf("{");        
        const end = text.lastIndexOf("}");       
        const jsonText = text.slice(start, end + 1);              
        if (start === -1 || end === -1){
            throw new Error("Wasn't valid JSON.");
        }
        data = JSON.parse(jsonText);
    } catch{
        console.error("Claude's reply wasn't valid JSON.", text);
        throw new Error("Reply was garbled. Please try again.");
    }
    if (!isCoachingFeedback(data)){
        console.error("Claude's reply was missing summary, strengths, or improvements.");
        throw new Error("Reply was garbled. Please try again.")
    }
    return data as CoachingFeedback;
}
