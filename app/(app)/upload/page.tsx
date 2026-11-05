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
                            className="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-b from-primary/5 to-transparent px-6 py-14 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:from-primary/10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
                            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                                {file ? <FileAudio className="size-7" /> : <UploadIcon className="size-7" />}
                            </span>
                            {file ? (
                                <span>
                                    <span className="block font-medium break-all">{file.name}</span>
                                    <span className="text-sm text-muted-foreground">{formatSize(file.size)} · click to choose a different file</span>
                                </span>
                            ) : (
                                <span>
                                    <span className="block font-heading text-lg font-semibold">Click to choose an audio file</span>
                                    <span className="mt-2 flex justify-center gap-2 text-xs font-medium text-muted-foreground">
                                        {["MP3", "WAV", "M4A", "up to 50 MB"].map((tag) => (
                                            <span key={tag} className="rounded-full border bg-background px-2.5 py-0.5">{tag}</span>
                                        ))}
                                    </span>
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
            {/* what happens after you press Upload, so the wait doesn't feel like a mystery */}
            <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                    ["1", "Upload", "Your recording is saved privately to your account."],
                    ["2", "Transcribe", "Every word is timed so we can measure pace and pauses."],
                    ["3", "Coaching", "You get specific feedback on what to fix next."],
                ].map(([num, title, text]) => (
                    <li key={num} className="rounded-xl border bg-card p-4">
                        <span className="font-heading text-2xl font-bold text-primary">{num}</span>
                        <p className="mt-1 font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                    </li>
                ))}
            </ol>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" /> Only you can see your recordings.
            </p>
        </main>
    );
}
