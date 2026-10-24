import type { Transcript } from "@/lib/transcription/types";
// transcribeAudio(audioURL) returns a Transcript
// 1. Get the API key from .env.local 
//if it is missing, give me the error and i will readd it
// 2. Submit: send a post request to /v2/transcript with the { audio_url: audioURL } ; save the job id from the reply
// 3. Poll: every 5 seconds, send a check in request to /v2/transcript/{id}, give up after 3 minutes
//    - if status is completed → stop and go to step 4
//    - if status is error → stop and throw an error
//    - otherwise → wait and check again
// 4. Convert: build our Transcript from their reply
//    - text ← reply's text
//    - words ← the reply's words (each word has text, start, end, confidence)
//    - durationMs ← reply's audio_duration * 1000 (careful with units!)
// 5. Return the Transcript
// SUMMARY: sends an audio link to AssemblyAI and waits for the finished transcript.
// Transcription isn't instant, so it works in two phases: submit a job (get an id back),
// then ask for the result every 5 seconds until it is done, fails, or 3 minutes pass.
// Plain fetch is used instead of an SDK, and only on the server so the key stays secret.
export async function transcribeAudio(audioURL: string): Promise<Transcript> {
  const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
  if (!assemblyKey){
    console.error("ASSEMBLYAI_API_KEY is missing. Add it to .env.local");
    throw new Error("Transcription isn't available right now. Please try again later.");
  }
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: assemblyKey,
      "content-type": "application/json",
    },
    // disfluencies: true keeps "um" and "uh" in the transcript. By default AssemblyAI deletes them,
    // which would make our filler-word counting impossible.
    body: JSON.stringify({audio_url: audioURL, disfluencies: true}),
  });
  if (!response.ok){
    console.error(`Submitting transcription failed: ${response.status}`);
    throw new Error("Transcription couldn't start. Please try again.");
  }
  const data: { id: string } = await response.json();
  const jobID = data.id;
  const startedAt = Date.now();
  const limitMs = 3*60*1000;
  // Polling loop. The time limit stops it from running forever if AssemblyAI never finishes.
  while (true){
    if (Date.now() - startedAt > limitMs){
      throw new Error("Transcription took too long. Try a shorter recording.");
    }
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${jobID}`,{
      headers: { authorization: assemblyKey},
    });
    if (!response.ok) {
      console.error(`Checking transcription failed: ${response.status}`);
      throw new Error("Transcription was interrupted. Please try again.");
    }
    const result: {
      status: string;
      error?: string;
      text: string | null;
      words: { text: string; start: number; end: number; confidence: number }[] | null;
      audio_duration: number | null;
    } = await response.json();
    if (result.status === "completed"){
      if (!result.words || result.words.length === 0){
        throw new Error("No speech detected in the recording. Check the mic or try getting closer.");
      }
      return {
        text: result.text ?? "",
        words: (result.words ?? []).map((word) => ({
          text: word.text,
          start: word.start,
          end: word.end,
          confidence: word.confidence,
        })),
        // AssemblyAI reports the length in seconds but our app uses milliseconds everywhere
        durationMs: (result.audio_duration ?? 0) * 1000,
      };
    }
    if (result.status === "error"){
      console.error(`Transcription failed: ${result.error}`);
      throw new Error("Transcription failed. Please try again.");
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}