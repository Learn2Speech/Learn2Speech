// file: app/api/transcribe/route.ts  →  URL: /api/transcribe
import { transcribeAudio } from "@/lib/transcription/assemblyai";
import { createServerSupabase } from "@/lib/supabase-server";

export const maxDuration = 200;

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Please log in or sign up to transcribe audio." }, { status: 401 });
  }
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