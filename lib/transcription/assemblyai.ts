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

export async function transcribeAudio(audioURL: string){
  const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
  if (!assemblyKey){
    throw new Error("ASSEMBLYAI_API_KEY is missing. Add it to .env.local");
  }
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: assemblyKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({audio_url: audioURL}),
    });
  if (!response.ok){
    throw new Error(`Submitting transcription failed: ${response.status}`);
  }
  const data: { id: string } = await response.json();
  const jobID = data.id;
}