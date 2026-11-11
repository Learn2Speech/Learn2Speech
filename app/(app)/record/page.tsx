"use client";
// Record a speech with the microphone, listen back, then send it through the same
// upload + analyze steps as the Upload page. Recording is saved as MP4 audio when the
// browser can (Chrome, Edge, Safari), otherwise as WebM (Firefox). Both are allowed by
// validateAudio and the storage bucket (WebM needs migration 0006).
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Mic, Square} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import PracticeSwitch from "@/components/practice-switch";
import {Button} from "@/components/ui/button";
import Waiting from "@/components/upload/waiting";
import {createClient} from "@/lib/supabase";
import uploadRecording from "@/lib/upload-recording";
import VolumeBars from "@/components/record/volume-bars";

// stop automatically so a forgotten recording can't grow past the 50 MB upload limit
const MAX_SECONDS = 10 * 60;

// The formats we can save, in order of preference: MP4 first because every bucket already
// accepts it, then WebM for browsers that can't record MP4. The extension becomes the file name's ending.
const FORMATS = [
    {type: "audio/mp4", extension: "m4a"},
    {type: "audio/webm", extension: "webm"},
];

// The first format this browser can record, or undefined if it can't record any of them
function pickFormat() {
    if (typeof MediaRecorder === "undefined") return undefined;
    return FORMATS.find((f) => MediaRecorder.isTypeSupported(f.type));
}

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
    // the live microphone, kept while recording so the volume bars can listen to it
    const [stream, setStream] = useState<MediaStream | null>(null);

    // true once the user has left the page, so a mic allowed after leaving gets switched straight off
    const leftRef = useRef(false);
    // when recording started, so the clock is right even if a background tab slows the timer down
    const startedAtRef = useRef(0);

    // turn the microphone off if the user leaves the page mid-recording
    useEffect(() => {
        leftRef.current = false;
        return () => {
            leftRef.current = true;
            recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        };
    }, []);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
    // count up while recording and stop at the limit
    useEffect(() => {
        if (!recording) return;
        const timer = setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
        return () => clearInterval(timer);
    }, [recording]);
    useEffect(() => {
        if (recording && seconds >= MAX_SECONDS) recorderRef.current?.stop();
    }, [recording, seconds]);

    async function start() {
        setMessage("");
        setFile(null);
        setPreviewUrl("");
        const format = pickFormat();
        if (!navigator.mediaDevices || !format) {
            setMessage("This browser can't record audio. Try the latest Chrome, Safari, Edge or Firefox, or upload a file instead.");
            return;
        }
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({audio: true});
        } catch {
            setMessage("We couldn't use your microphone. Allow microphone access in your browser and try again.");
            return;
        }
        // they left while the "allow microphone?" prompt was open: don't leave the mic on
        if (leftRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
        }
        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(stream, {mimeType: format.type});
        } catch {
            stream.getTracks().forEach((t) => t.stop());
            setMessage("This browser can't record audio. Try the latest Chrome, Safari, Edge or Firefox, or upload a file instead.");
            return;
        }
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            setStream(null);
            // plain type (no ";codecs=..." suffix) so it matches validateAudio's allowed list
            const recorded = new File(chunks, `recording-${new Date().toISOString().slice(0, 16).replace("T", " ")}.${format.extension}`, {type: format.type});
            setFile(recorded);
            setPreviewUrl(URL.createObjectURL(recorded));
            setRecording(false);
        };
        recorderRef.current = recorder;
        setSeconds(0);
        startedAtRef.current = Date.now();
        recorder.start();
        setStream(stream);
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
        <main className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
                <PracticeSwitch current="/record" />
                <PageHeader title="Record a practice run" description="Record yourself speaking, listen back, then get feedback." />
            </div>
            {/* While it's saving and analyzing, the recorder is swapped for the same waiting screen as Upload */}
            {busy && file ? (
                <Waiting stage={working ? 1 : 0} fileName={file.name} />
            ) : (
                <div className="flex flex-col items-start gap-5 border-t border-foreground pt-6">
                    {/* the clock is the big teal number on this page */}
                    <p className="text-[clamp(6rem,18vw,12rem)] leading-[0.8] font-black tracking-[-0.04em] text-(--brand) tabular-nums" aria-live="off">{clock}</p>
                    {!recording ? (
                        <Button onClick={start} disabled={busy} className="h-12 px-6 text-base">
                            <Mic /> {file ? "Record again" : "Start recording"}
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={() => recorderRef.current?.stop()} className="h-12 px-6 text-base">
                            <Square /> Stop recording
                        </Button>
                    )}
                    {recording && stream && <VolumeBars stream={stream} />}
                    <p className="max-w-[60ch] text-sm text-muted-foreground">The microphone is only on while you record. Your audio is sent to AssemblyAI and Anthropic to make your feedback, as described in our <Link href="/privacy" target="_blank" className="underline underline-offset-4">Privacy Policy</Link>. Only record your own voice or people who agreed.</p>
                    {previewUrl && <audio controls src={previewUrl} className="w-full" />}
                    {file && !recording && (
                        <Button onClick={analyze} disabled={busy} className="h-12 w-full text-base">
                            {busy ? "Working..." : "Get feedback"}
                        </Button>
                    )}
                    {message && !working && <AuthMessage kind="error">{message}</AuthMessage>}
                </div>
            )}
        </main>
    );
}
