"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import validateAudio from "@/lib/validate-audio";
import buildAudioPath from "@/lib/build-audio-path";
import formatSize from "@/lib/format-size";
import Link from "next/link";
import {FileAudio, LockKeyhole, Upload as UploadIcon} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
export default function UploadPage() {
    const supabase = createClient();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    // true while the file is uploading, so the button can't be clicked twice
    const [uploading, setUploading] = useState(false);
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

    // Wraps handleUpload (unchanged) so the button can say "Uploading..." while it runs.
    async function submitWithLoading(event: React.FormEvent) {
        setUploading(true);
        await handleUpload(event);
        setUploading(false);
    }

    return (
        <main className="mx-auto w-full max-w-2xl px-6 py-10">
            <PageHeader title="Upload a speech" description="Choose a recording of yourself speaking. Shorter clips give faster feedback." />
            <Card className="[--card-spacing:--spacing(6)]">
                <CardContent>
                    <form onSubmit={submitWithLoading} className="space-y-5">
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
                        <input id="audio" type="file" accept="audio/*" required
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="sr-only" />
                        {/* green only for the success text, red for every error */}
                        {message && (
                            <AuthMessage kind={message === "Upload successful!" ? "success" : "error"}>
                                {message}
                                {message === "Upload successful!" && <> <Link href="/history" className="font-medium underline underline-offset-4">See your recordings</Link></>}
                            </AuthMessage>
                        )}
                        <Button type="submit" disabled={!file || uploading} className="h-11 w-full text-base">
                            {uploading ? "Uploading..." : "Upload"}
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
