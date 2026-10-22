"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import validateAudio from "@/lib/validate-audio";
import buildAudioPath from "@/lib/build-audio-path";
export default function UploadPage() {
    const supabase = createClient();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    async function handleUpload(event: React.FormEvent) {
        event.preventDefault();
        setMessage("");
        if (!file) return;
        const problem = validateAudio(file)
        if (problem) {
            setMessage(problem)
            return;
        }
        const {data} = await supabase.auth.getUser()
        if (!data.user) {
            setMessage("Please log in before attempting an upload!")
            return;
        }
        const address = buildAudioPath(data.user.id, file.name)
        
        const {error: uploadError} = await supabase.storage.from("recordings").upload(address, file)
        if (uploadError) {
            {setMessage(uploadError.message); return; }
        } 

        const {error: insertError} = await supabase.from("recordings").insert({
            user_id: data.user.id,
            file_path: address,
            original_name: file.name,
            size_bytes: file.size

        })
        if (insertError) {
            await supabase.storage.from("recordings").remove([address]);
            setMessage(insertError.message)
            return;
        }

        setMessage("Upload successful!")

    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <form onSubmit={handleUpload} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 text-zinc-900 shadow">
                <h1 className="text-2xl font-semibold">Upload a Recording</h1>
                <div>
                    <label htmlFor="audio" className="block text-sm font-medium">Audio file (mp3, wav, or m4a)</label>
                    {/* accept only filters the file picker; real checks happen in validateAudio */}
                    <input id="audio" type="file" accept="audio/*" required
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
                    {/* green only for the success text, red for every error */}
                    {message && <p className={message === "Upload successful!" ? "text-sm text-green-600" : "text-sm text-red-600"}>{message}</p>}
                </div>
                <button type="submit" disabled={!file}
                    className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">Upload
                </button>
            </form>
        </main>
    );
}
