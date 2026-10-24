"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import validateAudio from "@/lib/validate-audio";
import buildAudioPath from "@/lib/build-audio-path";
import formatSize from "@/lib/format-size";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {FileAudio, Loader2, LockKeyhole, Upload as UploadIcon} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
export default function UploadPage() {
    const supabase = createClient();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false)
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

        setBusy(true)
        
        const {error: uploadError} = await supabase.storage.from("recordings").upload(address, file)
        if (uploadError) {
            {setMessage(uploadError.message); setBusy(false); return; }
        } 

        // .select("id").single() asks Supabase to send back the row we just made,
        // because the analyze route's address needs the new recording's id
        const {data: newRecording, error: insertError} = await supabase.from("recordings").insert({
            user_id: data.user.id,
            file_path: address,
            original_name: file.name,
            size_bytes: file.size

        }).select("id").single()
        if (insertError) {
            await supabase.storage.from("recordings").remove([address]);
            setMessage(insertError.message)
            setBusy(false)
            return;
        }
        
        setMessage("Analyzing...this can take a few minutes.")

        try {
            // Knocks on the analyze route and waits (up to a few minutes) for its answer
            const response = await fetch(`/api/recordings/${newRecording.id}/analyze`, {method: "POST"})
            const result = await response.json()
            if (!response.ok) {
                // The route reached us but said no; it sends {error: "..."}
                setMessage(result.error)
            } else {
                setMessage("Analysis complete!")
                // open the results right away; the results page lives at a real address, so it survives a refresh
                router.push(`/history/${newRecording.id}`)
            }
        } catch {
            // The request never got an answer (no wifi, server down)
            setMessage("Could not reach the server. Please try again.")
        }

        // Every way out of the function has to switch busy off, or the button stays locked
        setBusy(false)
    }

    // Akshith's messages decide which box to show: done (green), still working (orange, spinning), or an error (red).
    const done = message === "Analysis complete!";
    const working = message.startsWith("Analyzing");

    return (
        <main className="mx-auto w-full max-w-2xl px-6 py-10">
            <PageHeader title="Upload a speech" description="Choose a recording of yourself speaking. Shorter clips give faster feedback." />
            <Card className="[--card-spacing:--spacing(6)]">
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-5">
                        {/* the whole dashed box is the label, so clicking anywhere in it opens the file picker */}
                        <label htmlFor="audio"
                            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-accent/40 px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-accent">
                            <span className="flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                                {file ? <FileAudio className="size-6" /> : <UploadIcon className="size-6" />}
                            </span>
                            {file ? (
                                <span>
                                    <span className="block font-medium break-all">{file.name}</span>
                                    <span className="text-sm text-muted-foreground">{formatSize(file.size)} · click to choose a different file</span>
                                </span>
                            ) : (
                                <span>
                                    <span className="block font-medium">Click to choose an audio file</span>
                                    <span className="text-sm text-muted-foreground">mp3, wav or m4a, up to 50 MB</span>
                                </span>
                            )}
                        </label>
                        {/* accept only filters the file picker; real checks happen in validateAudio */}
                        {/* sr-only hides the plain browser input but keeps it usable for keyboards and screen readers */}
                        <input id="audio" type="file" accept="audio/*" required disabled={busy}
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="sr-only" />
                        {message && working && (
                            <p role="status" className="flex items-center gap-2 rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
                                <Loader2 className="size-4 shrink-0 animate-spin" /> {message}
                            </p>
                        )}
                        {message && !working && (
                            <AuthMessage kind={done ? "success" : "error"}>
                                {message}
                                {done && <> <Link href="/history" className="font-medium underline underline-offset-4">See it in your history</Link></>}
                            </AuthMessage>
                        )}
                        <Button type="submit" disabled={!file || busy} className="h-11 w-full text-base">
                            {busy ? (working ? "Analyzing..." : "Uploading...") : "Upload"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" /> Only you can see your recordings.
            </p>
        </main>
    );
}
