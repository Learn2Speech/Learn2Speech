// file: app/api/transcribe/route.ts  →  URL: /api/transcribe
import { transcribeAudio } from "@/lib/transcription/assemblyai";
export const maxDuration = 200;

export async function POST(request: Request) {
  const body: { audioUrl?: unknown } = await request.json();

  if (typeof body.audioUrl !== "string" || body.audioUrl === "") {
    return Response.json({ error: "audioUrl is required" }, { status: 400 });
  }

  try {
    const result = await transcribeAudio(body.audioUrl);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";
    return Response.json({ error: message }, { status: 500 });
  }
}