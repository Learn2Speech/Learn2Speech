import type {SupabaseClient} from "@supabase/supabase-js";
import validateAudio from "@/lib/validate-audio";
import buildAudioPath from "@/lib/build-audio-path";

// Shared by the Upload page and the Record page: checks the file, saves it to private storage,
// adds its row, then asks the server to analyze it. Returns the new recording's id, or throws
// an Error whose message is safe to show to the user.
export default async function uploadRecording(supabase: SupabaseClient, file: File, onAnalyzing?: () => void): Promise<string> {
    const problem = validateAudio(file);
    if (problem) throw new Error(problem);
    const {data} = await supabase.auth.getUser();
    if (!data.user) throw new Error("Please log in before attempting an upload!");
    const address = buildAudioPath(data.user.id, file.name);
    const {error: uploadError} = await supabase.storage.from("recordings").upload(address, file);
    if (uploadError) {
        console.error("Upload failed", uploadError.message);
        throw new Error("Upload failed. Please try again.");
    }
    // .select("id").single() sends back the row we just made, because the analyze route's address needs its id
    const {data: newRecording, error: insertError} = await supabase.from("recordings").insert({
        user_id: data.user.id,
        file_path: address,
        original_name: file.name,
        size_bytes: file.size,
    }).select("id").single();
    if (insertError) {
        await supabase.storage.from("recordings").remove([address]);
        console.error("Saving recording failed", insertError.message);
        throw new Error("Could not save your recording. Please try again.");
    }
    onAnalyzing?.();
    let response: Response;
    try {
        response = await fetch(`/api/recordings/${newRecording.id}/analyze`, {method: "POST"});
    } catch {
        // The request never got an answer (no wifi, server down)
        throw new Error("Could not reach the server. Please try again.");
    }
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Analysis failed. Please try again.");
    }
    return newRecording.id;
}
