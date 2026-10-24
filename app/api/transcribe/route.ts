// file: app/api/transcribe/route.ts  →  URL: /api/transcribe
// SUMMARY: a thin web address around transcribeAudio. It checks the caller is logged in and
// that the request has an audioUrl, then returns the Transcript as JSON. The real work lives
// in lib/transcription/assemblyai.ts; the main upload flow calls that function directly from
// the analyze route, so this endpoint is mainly for testing transcription on its own.
import { transcribeAudio } from "@/lib/transcription/assemblyai";
import { createServerSupabase } from "@/lib/supabase-server";

// Transcription can take a couple of minutes, so allow up to 200 seconds before Vercel cuts it off.
export const maxDuration = 200;

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  // Only logged-in users may use this, because every call costs money (paid transcription API)
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