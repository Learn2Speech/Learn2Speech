"use client";
// Record a speech with the microphone, listen back, then send it through the same
// upload + analyze steps as the Upload page. Recording is saved as MP4 audio when the
// browser can (Chrome, Edge, Safari), otherwise as WebM (Firefox). Both are allowed by
// validateAudio and the storage bucket (WebM needs migration 0006).
//
// Two modes:
//   Free practice - say whatever you want, the clock counts up.
//   Impromptu     - get a random topic from our built-in list, pick 1, 2 or 3 minutes, optionally take
//                   30 seconds to think (recording starts by itself after), then the clock counts DOWN and
//                   warns you near the end. The topic and length are saved with the recording (migration 0008)
//                   so the feedback can also judge staying on topic, structure and use of time.
import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {Mic, Shuffle, Square} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import PracticeSwitch from "@/components/practice-switch";
import {Button} from "@/components/ui/button";
import Waiting from "@/components/upload/waiting";
import {createClient} from "@/lib/supabase";
import uploadRecording from "@/lib/upload-recording";
import VolumeBars from "@/components/record/volume-bars";
import MicCheck from "@/components/record/mic-check";
import {formatClock, randomTopic, SPEECH_LENGTHS, type ImpromptuInfo, type SpeechLength} from "@/lib/impromptu/topics";
import {cn} from "@/lib/utils";

// stop automatically so a forgotten recording can't grow past the 50 MB upload limit
const MAX_SECONDS = 10 * 60;
// impromptu: thinking time before recording starts, and how far past the target you may go before it stops
const THINK_SECONDS = 30;
const GRACE_SECONDS = 30;

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

type Mode = "free" | "impromptu";
type Phase = "idle" | "thinking" | "recording";

// /record?mode=impromptu (the "Try another topic" link on results) opens in impromptu mode. Read from the
// address bar in the browser only; the server render (and the first browser render) assume free practice.
const noSubscribe = () => () => {};
const urlSaysImpromptu = () => new URLSearchParams(window.location.search).get("mode") === "impromptu";
const onServer = () => false;

export default function RecordPage() {
    const supabase = createClient();
    const router = useRouter();
    // the mode the user picked with the switch; until they pick one, the address bar decides
    const [pickedMode, setMode] = useState<Mode | null>(null);
    const fromUrl = useSyncExternalStore(noSubscribe, urlSaysImpromptu, onServer);
    const mode: Mode = pickedMode ?? (fromUrl ? "impromptu" : "free");
    const [phase, setPhase] = useState<Phase>("idle");
    // when the current phase started, the latest clock tick, and how many seconds the phase may run
    const [phaseStart, setPhaseStart] = useState(0);
    const [now, setNow] = useState(0);
    const [limit, setLimit] = useState(MAX_SECONDS);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const recorderRef = useRef<MediaRecorder | null>(null);
    // the live microphone, kept while recording so the volume bars can listen to it
    const [stream, setStream] = useState<MediaStream | null>(null);

    // impromptu choices
    const [topic, setTopic] = useState("");
    const [length, setLength] = useState<SpeechLength>(120);
    const [thinkFirst, setThinkFirst] = useState(true);
    // the topic + length the current take was recorded with (null for free practice). Saved with the
    // recording, so changing the choices afterwards can't mislabel a take.
    const [take, setTake] = useState<ImpromptuInfo | null>(null);

    // true once the user has left the page, so a mic allowed after leaving gets switched straight off
    const leftRef = useRef(false);

    // turn the microphone off if the user leaves the page mid-recording (or mid-thinking)
    useEffect(() => {
        leftRef.current = false;
        return () => {
            leftRef.current = true;
            recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        };
    }, []);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    // Starts the recorder that start() already set up (right away, or when thinking time ends)
    const beginRecording = useCallback((target: number | null) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state !== "inactive") return;
        recorder.start();
        const t = Date.now();
        setPhaseStart(t);
        setNow(t);
        setLimit(target === null ? MAX_SECONDS : Math.min(MAX_SECONDS, target + GRACE_SECONDS));
        setPhase("recording");
    }, []);

    function stopRecording() {
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
    }

    // The clock: ticks while thinking or recording. Measured from the start time (not by counting ticks)
    // so it stays right even if a background tab slows the timer down. When the phase's time is up,
    // thinking turns into recording and recording stops.
    useEffect(() => {
        if (phase === "idle") return;
        const timer = setInterval(() => {
            const t = Date.now();
            setNow(t);
            if ((t - phaseStart) / 1000 < limit) return;
            if (phase === "thinking") beginRecording(take?.targetSeconds ?? null);
            else stopRecording();
        }, 250);
        return () => clearInterval(timer);
    }, [phase, phaseStart, limit, take, beginRecording]);

    // Throws away the last take (used when the topic, length or mode changes, so a take always matches what's on screen)
    function clearTake() {
        setFile(null);
        setPreviewUrl("");
        setNow(0);
        setPhaseStart(0);
    }

    function switchMode(next: Mode) {
        if (next === mode) return;
        setMode(next);
        setMessage("");
        clearTake();
    }

    function newTopic() {
        setTopic((t) => randomTopic(t));
        setMessage("");
        clearTake();
    }

    async function start() {
        setMessage("");
        clearTake();
        const impromptu: ImpromptuInfo | null = mode === "impromptu" && topic ? {topic, targetSeconds: length} : null;
        if (mode === "impromptu" && !impromptu) return;
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
            const prefix = impromptu ? "impromptu" : "recording";
            const recorded = new File(chunks, `${prefix}-${new Date().toISOString().slice(0, 16).replace("T", " ")}.${format.extension}`, {type: format.type});
            setFile(recorded);
            setPreviewUrl(URL.createObjectURL(recorded));
            setNow(Date.now());
            setPhase("idle");
        };
        // The mic is asked for BEFORE thinking time, so the "allow microphone?" prompt doesn't eat into it
        // and recording can start the instant thinking ends. Nothing is recorded while thinking.
        recorderRef.current = recorder;
        setTake(impromptu);
        setStream(stream);
        if (impromptu && thinkFirst) {
            const t = Date.now();
            setPhaseStart(t);
            setNow(t);
            setLimit(THINK_SECONDS);
            setPhase("thinking");
        } else {
            beginRecording(impromptu?.targetSeconds ?? null);
        }
    }

    // Leave thinking time without recording: mic off, back to the start
    function cancelThinking() {
        recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        recorderRef.current = null;
        setStream(null);
        setPhase("idle");
        clearTake();
    }

    async function analyze() {
        if (!file) return;
        setBusy(true);
        setMessage("");
        try {
            const id = await uploadRecording(supabase, file, () => setMessage("Analyzing...this can take a few minutes."), take);
            router.push(`/history/${id}`);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setBusy(false);
        }
    }

    const working = message.startsWith("Analyzing");
    const elapsed = Math.max(0, Math.floor((now - phaseStart) / 1000));
    const thinking = phase === "thinking";
    const recording = phase === "recording";
    const active = thinking || recording;
    const impromptuMode = mode === "impromptu";

    // What the big number says and how it looks
    let clock = formatClock(elapsed);
    let clockTone = "text-(--brand)";
    let status = ""; // short line under the clock, also read out by screen readers when it changes
    if (thinking) {
        clock = formatClock(THINK_SECONDS - elapsed);
        status = "Thinking time. Recording starts by itself when it hits 0:00.";
    } else if (take && (recording || file)) {
        const left = take.targetSeconds - elapsed;
        const warnAt = take.targetSeconds >= 120 ? 30 : 15;
        if (recording) {
            clock = left >= 0 ? formatClock(left) : `+${formatClock(-left)}`;
            if (left <= 0) {
                clockTone = "text-destructive";
                status = `Time's up. Finish your sentence (stops in ${formatClock(GRACE_SECONDS + left)}).`;
            } else if (left <= warnAt) {
                clockTone = "text-orange";
                status = `${left} seconds left. Start wrapping up.`;
            } else {
                status = `Speaking. ${formatClock(take.targetSeconds)} to fill.`;
            }
        } else {
            clock = formatClock(elapsed);
            status = `You spoke for ${formatClock(elapsed)} of ${formatClock(take.targetSeconds)}.`;
        }
    }
    // the screen-reader version only changes at the warning steps, not every second
    const announce = status.replace(/\d+ seconds left/, "Less than a minute left").replace(/\(stops in .*\)/, "");

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <MicCheck />
            <div>
                <PracticeSwitch current="/record" />
                <PageHeader
                    title={impromptuMode ? "Impromptu speaking" : "Record a practice run"}
                    description={impromptuMode
                        ? "Get a random topic, take a moment to think, then speak for 1, 2 or 3 minutes. Your feedback also covers staying on topic, structure and timing."
                        : "Record yourself speaking, listen back, then get feedback."}
                />
                {/* Free practice or impromptu. Locked while thinking or recording. */}
                <div role="group" aria-label="Practice mode" className="inline-flex rounded-lg border bg-secondary p-1">
                    {([["free", "Free practice"], ["impromptu", "Impromptu"]] as const).map(([value, label]) => (
                        <button key={value} type="button" onClick={() => switchMode(value)} disabled={active || busy}
                            aria-pressed={mode === value}
                            className={cn("h-10 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50",
                                mode === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {/* While it's saving and analyzing, the recorder is swapped for the same waiting screen as Upload */}
            {busy && file ? (
                <Waiting stage={working ? 1 : 0} fileName={file.name} />
            ) : (
                <div className="flex flex-col items-start gap-5 border-t border-foreground pt-6">
                    {impromptuMode && (
                        <ImpromptuSetup topic={topic} onNewTopic={newTopic} length={length} thinkFirst={thinkFirst} locked={active}
                            onLength={(l) => { setLength(l); clearTake(); }} onThinkFirst={setThinkFirst} />
                    )}
                    {(!impromptuMode || topic) && (
                        <>
                            {/* the clock is the big teal number on this page (orange near the end, red past it) */}
                            <div>
                                {impromptuMode && (
                                    <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                                        {thinking ? "Think" : recording ? "Time left" : file ? "Your time" : "Ready"}
                                    </p>
                                )}
                                <p className={cn("text-[clamp(6rem,18vw,12rem)] leading-[0.8] font-black tracking-[-0.04em] tabular-nums transition-colors", clockTone)} aria-hidden={impromptuMode}>
                                    {impromptuMode && phase === "idle" && !file ? formatClock(length) : clock}
                                </p>
                                {status && <p className="mt-3 text-lg text-muted-foreground">{status}</p>}
                                <p className="sr-only" aria-live="polite">{announce}</p>
                            </div>
                            {thinking ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => beginRecording(take?.targetSeconds ?? null)} data-sound="start" className="h-12 px-6 text-base">
                                        <Mic /> Start speaking now
                                    </Button>
                                    <Button variant="outline" onClick={cancelThinking} className="h-12 px-6 text-base">Cancel</Button>
                                </div>
                            ) : !recording ? (
                                <Button onClick={start} disabled={busy} data-sound="start" className="h-12 px-6 text-base">
                                    <Mic /> {file ? "Record again" : impromptuMode && thinkFirst ? "Start (30 s to think)" : "Start recording"}
                                </Button>
                            ) : (
                                <Button variant="destructive" onClick={stopRecording} data-sound="stop" className="h-12 px-6 text-base">
                                    <Square /> Stop recording
                                </Button>
                            )}
                            {recording && stream && <VolumeBars stream={stream} />}
                            {previewUrl && <audio controls src={previewUrl} className="w-full" />}
                            {file && !active && (
                                <Button onClick={analyze} disabled={busy} className="h-12 w-full text-base">
                                    {busy ? "Working..." : "Get feedback"}
                                </Button>
                            )}
                        </>
                    )}
                    {message && !working && <AuthMessage kind="error">{message}</AuthMessage>}
                </div>
            )}
        </main>
    );
}

// The impromptu choices above the clock: the topic (with a button to get one or a different one),
// the speech length, and whether to take 30 seconds to think first.
function ImpromptuSetup({topic, onNewTopic, length, onLength, thinkFirst, onThinkFirst, locked}: {
    topic: string;
    onNewTopic: () => void;
    length: SpeechLength;
    onLength: (l: SpeechLength) => void;
    thinkFirst: boolean;
    onThinkFirst: (on: boolean) => void;
    locked: boolean;
}) {
    return (
        <div className="w-full space-y-6">
            {topic ? (
                <div>
                    <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your topic</p>
                    <p className="mt-2 max-w-[30ch] text-3xl leading-[1.1] font-semibold sm:text-4xl" aria-live="polite">{topic}</p>
                    {!locked && (
                        <Button variant="outline" onClick={onNewTopic} className="mt-4 h-10">
                            <Shuffle /> Different topic
                        </Button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="max-w-[45ch] text-lg text-muted-foreground">You&apos;ll get a random question to speak about, the way impromptu rounds work in speech and debate.</p>
                    <Button onClick={onNewTopic} className="mt-4 h-12 px-6 text-base">
                        <Shuffle /> Give me a topic
                    </Button>
                </div>
            )}
            {topic && !locked && (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div role="group" aria-label="Speech length" className="inline-flex rounded-lg border bg-secondary p-1">
                        {SPEECH_LENGTHS.map((seconds) => (
                            <button key={seconds} type="button" onClick={() => onLength(seconds)} aria-pressed={length === seconds}
                                className={cn("h-10 rounded-md px-4 text-sm font-medium tabular-nums transition-colors",
                                    length === seconds ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                {seconds / 60} min
                            </button>
                        ))}
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input type="checkbox" checked={thinkFirst} onChange={(e) => onThinkFirst(e.target.checked)}
                            className="size-4 accent-(--orange)" />
                        30 seconds to think first
                    </label>
                </div>
            )}
        </div>
    );
}
