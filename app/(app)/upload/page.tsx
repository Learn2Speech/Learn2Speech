"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import uploadRecording from "@/lib/upload-recording";
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
        setBusy(true)
        try {
            const id = await uploadRecording(supabase, file, () => setMessage("Analyzing...this can take a few minutes."))
            setMessage("Analysis complete!")
            // open the results right away; the results page lives at a real address, so it survives a refresh
            router.push(`/history/${id}`)
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        }

        // Every way out of the function has to switch busy off, or the button stays locked
        setBusy(false)
    }

    // Akshith's messages decide which box to show: done (green), still working (teal, spinning), or an error (red).
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
                            className="flex cursor-pointer flex-col items-start gap-3 rounded-lg border border-dashed border-input px-6 py-12 transition-colors hover:border-brand hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 sm:items-center sm:text-center">
                            {file ? <FileAudio className="size-6 text-brand" /> : <UploadIcon className="size-6 text-muted-foreground" />}
                            {file ? (
                                <span>
                                    <span className="block font-medium break-all">{file.name}</span>
                                    <span className="text-sm text-muted-foreground">{formatSize(file.size)} · choose a different file</span>
                                </span>
                            ) : (
                                <span>
                                    <span className="block font-medium">Choose an audio file</span>
                                    <span className="mt-1 block text-sm text-muted-foreground">MP3, WAV or M4A, up to 50 MB</span>
                                </span>
                            )}
                        </label>
                        {/* accept only filters the file picker; real checks happen in validateAudio */}
                        {/* sr-only hides the plain browser input but keeps it usable for keyboards and screen readers */}
                        <input id="audio" type="file" accept="audio/*" required disabled={busy}
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="sr-only" />
                        {message && working && (
                            <p role="status" className="flex items-center gap-2 rounded-md border border-brand/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
                                <Loader2 className="size-4 shrink-0 animate-spin" /> {message}
                            </p>
                        )}
                        {message && !working && (
                            <AuthMessage kind={done ? "success" : "error"}>
                                {message}
                                {done && <> <Link href="/history" className="font-medium underline underline-offset-4">See it in your history</Link></>}
                            </AuthMessage>
                        )}
                        <Button type="submit" disabled={!file || busy} size="lg" className="w-full">
                            {busy ? (working ? "Analyzing..." : "Uploading...") : "Upload"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <p className="mt-4 text-sm text-muted-foreground">
                No recording yet? <Link href="/record" className="font-medium text-foreground underline underline-offset-4">Record with your microphone</Link> instead.
            </p>
            {/* what happens after you press Upload, so the wait doesn't feel like a mystery */}
            <ol className="mt-8 space-y-2 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground">Upload.</span> Your recording is saved privately to your account.</li>
                <li><span className="font-medium text-foreground">Transcribe.</span> Every word is timed so we can measure pace and pauses.</li>
                <li><span className="font-medium text-foreground">Coaching.</span> You get specific feedback on what to fix next.</li>
            </ol>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" /> Only you can see your recordings.
            </p>
        </main>
    );
}
