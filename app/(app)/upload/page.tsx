"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import uploadRecording from "@/lib/upload-recording";
import formatSize from "@/lib/format-size";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {FileAudio, LockKeyhole, Upload as UploadIcon} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import Waiting from "@/components/upload/waiting";
import PracticeSwitch from "@/components/practice-switch";
import {Button} from "@/components/ui/button";
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

    // Akshith's messages decide what to show: done (green), still working (the waiting screen), or an error (red).
    const done = message === "Analysis complete!";
    const working = message.startsWith("Analyzing");

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
                <PracticeSwitch current="/upload" />
                <h1 className="text-4xl leading-[1.02] font-semibold sm:text-5xl">Upload a practice run</h1>
                <p className="mt-4 max-w-[40ch] text-lg text-muted-foreground">
                    Choose a recording of yourself speaking. Shorter clips give faster feedback.
                </p>
                <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <LockKeyhole className="size-4" /> Only you can see your recordings.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Not sure what you&apos;ll get? <Link href="/demo" className="font-medium text-foreground underline underline-offset-4">Try the tutorial</Link>
                </p>
            </div>

            {/* While it's saving and analyzing, the form is swapped for the waiting screen */}
            {busy && file ? (
                <Waiting stage={working ? 1 : 0} fileName={file.name} />
            ) : (
                <form onSubmit={handleUpload} className="space-y-5">
                    {/* the whole dashed box is the label, so clicking anywhere in it opens the file picker */}
                    <label htmlFor="audio"
                        className="flex min-h-56 cursor-pointer flex-col items-start justify-center gap-3 rounded-lg border-2 border-dashed border-input px-6 py-12 transition-colors duration-150 hover:border-brand hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
                        {file ? <FileAudio className="size-8 text-brand" /> : <UploadIcon className="size-8 text-muted-foreground" />}
                        {file ? (
                            <span>
                                <span className="block text-2xl font-semibold break-all">{file.name}</span>
                                <span className="mt-1 block text-muted-foreground">{formatSize(file.size)} · choose a different file</span>
                            </span>
                        ) : (
                            <span>
                                <span className="block text-2xl font-semibold">Choose an audio file</span>
                                <span className="mt-1 block text-muted-foreground">MP3, WAV or M4A, up to 50 MB</span>
                            </span>
                        )}
                    </label>
                    {/* accept only filters the file picker; real checks happen in validateAudio */}
                    {/* sr-only hides the plain browser input but keeps it usable for keyboards and screen readers */}
                    <input id="audio" type="file" accept="audio/*" required
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="sr-only" />
                    {message && !working && (
                        <AuthMessage kind={done ? "success" : "error"}>
                            {message}
                            {done && <> <Link href="/history" className="font-medium underline underline-offset-4">See it in your history</Link></>}
                        </AuthMessage>
                    )}
                    <Button type="submit" disabled={!file} size="lg" className="h-12 w-full text-base">
                        Upload and analyze
                    </Button>
                </form>
            )}
        </main>
    );
}
