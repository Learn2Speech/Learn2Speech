// Redo a speech: "Redo this speech" on a results page opens /record?redo=<id> (or /upload?redo=<id>).
// This reads that id from the address bar and loads what the new take should reuse from the earlier one:
// its impromptu topic and length, its typed topic, and its script. The comparison itself is shown on the
// new take's results page (components/redo/redo-compare.tsx).
import type { SupabaseClient } from "@supabase/supabase-js";
import { impromptuFromRow, type ImpromptuInfo } from "@/lib/impromptu/topics";
import type { CoachingFeedback } from "@/lib/feedback/types";

export type RedoInfo = {
  id: string;
  name: string; // the earlier take's file name, for the banner
  impromptu: ImpromptuInfo | null;
  topic: string | null; // typed topic (topic mode)
  script: string | null; // pasted script (script mode)
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The redo id in the address bar, or null. Browser only (the server render has no address bar).
export function redoIdFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get("redo");
  return id && UUID.test(id) ? id : null;
}

// Loads the earlier take. Row Level Security only returns the user's own rows, so someone else's id
// (or one that isn't finished) gives null and the page just carries on as a normal practice.
export async function loadRedo(supabase: SupabaseClient, id: string): Promise<RedoInfo | null> {
  const { data } = await supabase
    .from("recordings")
    .select("id, original_name, status, topic, target_seconds, feedback")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.status !== "done") return null;
  const feedback = data.feedback as CoachingFeedback | null;
  return {
    id: data.id,
    name: data.original_name,
    impromptu: impromptuFromRow(data),
    topic: feedback?.topic?.topic ?? null,
    script: feedback?.script?.text ?? null,
  };
}
