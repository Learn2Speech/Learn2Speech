"use client";
// Record a speech with the microphone, listen back, then send it through the same
// upload + analyze steps as the Upload page. Recording is saved as MP4 audio because
// that's already an allowed type for the private storage bucket (WebM is not).
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Loader2, Mic, Square} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {createClient} from "@/lib/supabase";
import uploadRecording from "@/lib/upload-recording";

// stop automatically so a forgotten recording can't grow past the 50 MB upload limit
const MAX_SECONDS = 10 * 60;

export default function RecordPage() {
    const supabase = createClient();
    const router = useRouter();
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const recorderRef = useRef<MediaRecorder | null>(null);

    // turn the microphone off if the user leaves the page mid-recording
    useEffect(() => () => recorderRef.current?.stream.getTracks().forEach((t) => t.stop()), []);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
    // count up while recording and stop at the limit
    useEffect(() => {
        if (!recording) return;
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, [recording]);
    useEffect(() => {
        if (recording && seconds >= MAX_SECONDS) recorderRef.current?.stop();
    }, [recording, seconds]);

    async function start() {
        setMessage("");
        setFile(null);
        setPreviewUrl("");
        if (!navigator.mediaDevices || typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported("audio/mp4")) {
            setMessage("This browser can't record audio. Try the latest Chrome, Safari or Edge, or upload a file instead.");
            return;
        }
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({audio: true});
        } catch {
            setMessage("We couldn't use your microphone. Allow microphone access in your browser and try again.");
            return;
        }
        const recorder = new MediaRecorder(stream, {mimeType: "audio/mp4"});
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            // plain "audio/mp4" (no codec suffix) so it matches validateAudio's allowed list
            const recorded = new File(chunks, `recording-${new Date().toISOString().slice(0, 16).replace("T", " ")}.m4a`, {type: "audio/mp4"});
            setFile(recorded);
            setPreviewUrl(URL.createObjectURL(recorded));
            setRecording(false);
        };
        recorderRef.current = recorder;
        setSeconds(0);
        recorder.start();
        setRecording(true);
    }

    async function analyze() {
        if (!file) return;
        setBusy(true);
        setMessage("");
        try {
            const id = await uploadRecording(supabase, file, () => setMessage("Analyzing...this can take a few minutes."));
            router.push(`/history/${id}`);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setBusy(false);
        }
    }

    const working = message.startsWith("Analyzing");
    const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

    return (
        <main className="mx-auto w-full max-w-2xl px-6 py-10">
            <PageHeader title="Record a speech" description="Record yourself speaking, listen back, then get feedback." />
            <Card className="[--card-spacing:--spacing(6)]">
                <CardContent className="flex flex-col items-center gap-5">
                    <p className="font-heading text-4xl font-semibold tabular-nums" aria-live="off">{clock}</p>
                    {!recording ? (
                        <Button onClick={start} disabled={busy} className="h-11 px-6 text-base">
                            <Mic /> {file ? "Record again" : "Start recording"}
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={() => recorderRef.current?.stop()} className="h-11 px-6 text-base">
                            <Square /> Stop recording
                        </Button>
                    )}
                    {previewUrl && <audio controls src={previewUrl} className="w-full" />}
                    {file && !recording && (
                        <Button onClick={analyze} disabled={busy} className="h-11 w-full text-base">
                            {busy ? "Working..." : "Get feedback"}
                        </Button>
                    )}
                    {message && working && (
                        <p role="status" className="flex items-center gap-2 rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
                            <Loader2 className="size-4 shrink-0 animate-spin" /> {message}
                        </p>
                    )}
                    {message && !working && <AuthMessage kind="error">{message}</AuthMessage>}
                </CardContent>
            </Card>
        </main>
    );
}
