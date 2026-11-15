"use client";
// Record a speech with the microphone, listen back, then send it through the same
// upload + analyze steps as the Upload page. Recording is saved as MP4 audio when the
// browser can (Chrome, Edge, Safari), otherwise as WebM (Firefox). Both are allowed by
// validateAudio and the storage bucket (WebM needs migration 0006).
//
// The recorder behind two pages (one component, so recording, clock and upload behave the same on both):
//   /record     Free practice - say whatever you want, the clock counts up. After the mic check a popup asks for your topic
//                   (or "Go topic-free"); a topic tunes the pace target and adds topic tips (components/topic).
//   /impromptu  Impromptu     - get a random topic from our built-in list, pick a length (0:30 to 5:00), optionally take
//                   30 seconds to think (recording starts by itself after), then the clock counts DOWN and
//                   warns you near the end. The topic and length are saved with the recording (migration 0008)
//                   so the feedback can also judge staying on topic, structure and use of time.
//
// Extras on this page (each lives in its own folder):
//   components/topic       - the typed topic and its popups (free practice)
//   components/script      - a pasted script, compared with what you said (free practice)
//   components/live-fillers - the optional live filler counter while recording (both modes)
//   components/redo        - /record?redo=<id>: record an earlier speech again, then compare the two takes
//   components/practice    - the shared "Get feedback" step that sends all of the above
import {useCallback, useEffect, useRef, useState} from "react";
import {CircleHelp, Mic, Minus, Plus, Shuffle, Square} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import PageHeader from "@/components/page-header";
import PracticeSwitch from "@/components/practice-switch";
import {Button} from "@/components/ui/button";
import Waiting from "@/components/upload/waiting";
import TopicBar from "@/components/topic/topic-bar";
import ScriptBar from "@/components/script/script-bar";
import {useScript} from "@/components/script/use-script";
import LiveFillerToggle from "@/components/live-fillers/live-filler-toggle";
import LiveFillerCounter from "@/components/live-fillers/live-filler-counter";
import {useLiveFillers} from "@/components/live-fillers/use-live-fillers";
import RedoBanner from "@/components/redo/redo-banner";
import {useRedo} from "@/components/redo/use-redo";
import {useGetFeedback} from "@/components/practice/use-get-feedback";
import VolumeBars from "@/components/record/volume-bars";
import MicCheck from "@/components/record/mic-check";
import {MIC_BLOCKED, MicPermissionNote, useMicPermission} from "@/components/record/mic-permission";
import {useImpromptuIntro} from "@/components/impromptu/impromptu-intro";
import TopicReel from "@/components/impromptu/topic-reel";
import {formatClock, LENGTH_STEP, MAX_LENGTH, MIN_LENGTH, randomTopic, type ImpromptuInfo, type SpeechLength} from "@/lib/impromptu/topics";
import {cn} from "@/lib/utils";

// stop automatically so a forgotten recording can't grow past the 50 MB upload limit
const MAX_SECONDS = 10 * 60;
// impromptu: thinking time before recording starts, and how far past the target you may go before it stops
const THINK_SECONDS = 30;
const GRACE_SECONDS = 30;
// a short speech gets a shorter grace period (half its length, at most 30 seconds)
const graceFor = (target: number) => Math.min(GRACE_SECONDS, target / 2);

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

export type Mode = "free" | "impromptu";
type Phase = "idle" | "thinking" | "recording";

export default function PracticeRecorder({mode}: {mode: Mode}) {
    // /record?redo=<id>: the earlier take being redone (components/redo). Its settings fill in below until
    // the speaker changes them, and "Stop redoing" puts everything back to normal.
    const redoFlow = useRedo();
    const earlier = redoFlow.redo;
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
    const [pickedTopic, setTopic] = useState("");
    const [pickedLength, setLength] = useState<SpeechLength | null>(null);
    const topic = pickedTopic || earlier?.impromptu?.topic || "";
    const length: SpeechLength = pickedLength ?? earlier?.impromptu?.targetSeconds ?? 120;
    const [thinkFirst, setThinkFirst] = useState(true);
    // the topic + length the current take was recorded with (null for free practice). Saved with the
    // recording, so changing the choices afterwards can't mislabel a take.
    const [take, setTake] = useState<ImpromptuInfo | null>(null);

    // free practice: a pasted script (components/script); a redo brings back the earlier take's script
    const scriptFlow = useScript(earlier ? earlier.script : undefined);
    // the typed topic, its popups, and the "Get feedback" step (impromptu takes ignore the typed topic and script)
    const topicFlow = useGetFeedback({
        file, impromptu: take, script: scriptFlow.script, redoOf: earlier?.id ?? null,
        redoTopic: earlier && !earlier.impromptu ? earlier.topic : undefined,
        // free practice asks for the topic when the page opens, like Upload (a redo brings its own topic)
        askOnStart: mode === "free", holdTopicPopup: redoFlow.loading || !!redoFlow.redo, setBusy, setMessage,
    });
    // impromptu: the "how it works" popup, shown once per device and again from its button
    // closing it (with a click, so the reel's ticks can play) draws the first topic
    const intro = useImpromptuIntro(() => { if (!topic) setTopic(randomTopic()); });
    // the mic check popup, opened by its button (not on page load)
    const [micOpen, setMicOpen] = useState(false);
    // whether the browser will ask for the microphone, already allows it, or blocks it
    const micPermission = useMicPermission();
    // the optional live filler counter; listens only while recording (components/live-fillers)
    const live = useLiveFillers(phase === "recording");

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
        setLimit(target === null ? MAX_SECONDS : Math.min(MAX_SECONDS, target + graceFor(target)));
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

    function newTopic() {
        setTopic(randomTopic(topic));
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
            setMessage(MIC_BLOCKED);
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
        const warnAt = take.targetSeconds >= 120 ? 30 : take.targetSeconds >= 60 ? 15 : 10;
        if (recording) {
            clock = left >= 0 ? formatClock(left) : `+${formatClock(-left)}`;
            if (left <= 0) {
                clockTone = "text-destructive";
                status = `Time's up. Finish your sentence (stops in ${formatClock(graceFor(take.targetSeconds) + left)}).`;
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
        <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            {/* Impromptu: the first visit explains the mode, and closing that spins in the first topic */}
            {mode === "impromptu" && intro.dialog}
            <MicCheck open={micOpen} onClose={() => setMicOpen(false)} />
            {topicFlow.dialogs}
            {scriptFlow.dialog}
            <div>
                <PracticeSwitch current={impromptuMode ? "/impromptu" : "/record"} />
                <PageHeader
                    title={impromptuMode ? "Impromptu speaking" : "Record a practice run"}
                    description={impromptuMode
                        ? "Get a random topic, think for 30 seconds, then speak. Feedback also covers topic, structure and timing."
                        : "Record yourself speaking, listen back, then get feedback."}
                />
                {impromptuMode && (
                    <Button variant="ghost" onClick={intro.show} disabled={active} className="-mt-6 -ml-3 h-10">
                        <CircleHelp /> How impromptu works
                    </Button>
                )}
            </div>
            {/* While it's saving and analyzing, the recorder is swapped for the same waiting screen as Upload */}
            {busy && file ? (
                <Waiting stage={working ? 1 : 0} fileName={file.name} />
            ) : (
                <div className="flex flex-col items-start gap-5 border-t border-foreground pt-6">
                    {redoFlow.redo && <RedoBanner redo={redoFlow.redo} onCancel={redoFlow.cancel} locked={active} />}
                    {!impromptuMode && (
                        <>
                            <TopicBar topic={topicFlow.topic} onChange={topicFlow.ask} onRemove={topicFlow.removeTopic} locked={active}
                                className="border-b pb-4" />
                            <ScriptBar script={scriptFlow.script} onEdit={scriptFlow.edit} onRemove={scriptFlow.remove} locked={active}
                                className="border-b pb-4" />
                        </>
                    )}
                    {impromptuMode && (
                        <ImpromptuSetup topic={topic} onNewTopic={newTopic} length={length} thinkFirst={thinkFirst} locked={active}
                            onLength={(l) => { setLength(l); clearTake(); }} onThinkFirst={setThinkFirst} />
                    )}
                    {(!impromptuMode || topic) && (
                        <>
                            {/* the clock is the big teal number on this page (orange near the end, red past it) */}
                            <div>
                                {impromptuMode && (thinking || recording || file) && (
                                    <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                                        {thinking ? "Think" : recording ? "Time left" : "Your time"}
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
                                <div className="flex flex-col items-start gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={start} disabled={busy} data-sound="start" className="h-12 px-6 text-base">
                                            <Mic /> {file ? "Record again" : impromptuMode && thinkFirst ? "Start: 30 seconds to think" : "Start recording"}
                                        </Button>
                                        {!file && (
                                            <Button variant="outline" onClick={() => setMicOpen(true)} disabled={busy} className="h-12 border-foreground/30! px-4 text-base">
                                                Check mic
                                            </Button>
                                        )}
                                    </div>
                                    <MicPermissionNote state={micPermission} />
                                </div>
                            ) : (
                                <Button variant="destructive" onClick={stopRecording} data-sound="stop" className="h-12 px-6 text-base">
                                    <Square /> Stop recording
                                </Button>
                            )}
                            {phase === "idle" && <LiveFillerToggle live={live} locked={busy} />}
                            {recording && stream && <VolumeBars stream={stream} />}
                            {(recording || (file && !active)) && <LiveFillerCounter live={live} recording={recording} />}
                            {previewUrl && <audio controls src={previewUrl} className="w-full" />}
                            {file && !active && (
                                <Button onClick={() => topicFlow.getFeedback()} disabled={busy} className="h-12 w-full text-base">
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

const STEP_CLASS = "flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-background disabled:opacity-40 disabled:hover:bg-transparent";

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
                    <div className="mt-1"><TopicReel topic={topic} className="max-w-[30ch] text-2xl leading-[1.1] font-semibold sm:text-4xl" /></div>
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
                    <Button variant="outline" onClick={onNewTopic} className="h-12 border-foreground/30!">
                        <Shuffle /> New topic
                    </Button>
                    {/* your own length, 0:30 to 5:00 in 15-second steps (the big clock below shows it too) */}
                    <div role="group" aria-label="Speech length" className="inline-flex items-center rounded-lg border bg-secondary p-1">
                        <button type="button" onClick={() => onLength(length - LENGTH_STEP)} disabled={length <= MIN_LENGTH}
                            aria-label="15 seconds shorter" className={STEP_CLASS}><Minus className="size-4" /></button>
                        <span className="min-w-14 text-center text-sm font-medium tabular-nums" aria-live="polite">
                            <span className="sr-only">Speech length </span>{formatClock(length)}
                        </span>
                        <button type="button" onClick={() => onLength(length + LENGTH_STEP)} disabled={length >= MAX_LENGTH}
                            aria-label="15 seconds longer" className={STEP_CLASS}><Plus className="size-4" /></button>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium sm:ml-5">
                        <input type="checkbox" checked={thinkFirst} onChange={(e) => onThinkFirst(e.target.checked)}
                            className="size-4 accent-(--orange)" />
                        30 seconds to think first
                    </label>
                </div>
            )}
        </div>
    );
}
