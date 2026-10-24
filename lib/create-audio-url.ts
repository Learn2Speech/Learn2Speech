import {createServerSupabase} from "@/lib/supabase-server"


// Takes the file that is being uploadeed to the bucket and identifies its cookies.
// After that, it basically extracts the file from the bucket and then converts it to a link to send to AssemblyAI
export default async function createAudioURL(file_path: string) {
     const supabase = await createServerSupabase();
     const {data, error} = await supabase.storage.from("recordings").createSignedUrl(file_path, 600)
     if (error) {
        throw new Error("Could not create a link for the audio.")
     }
     return data.signedUrl;

}