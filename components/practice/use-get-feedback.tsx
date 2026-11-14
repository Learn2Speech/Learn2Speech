"use client";
// The "Get feedback" step, shared by the Record and Upload pages. It holds the typed topic and its two popups
// (components/topic), and sends the recording with all its extras: topic, script (components/script) and
// the earlier take it redoes (components/redo).
//
// Get feedback:
//   1. free keysmash check on the topic in the browser (lib/topic/check-topic.ts). Fails -> "can't evaluate" popup, nothing uploaded.
//   2. upload + analyze. The server runs the free check again, then a short Claude check, before any transcription.
//      Rejected -> the same popup. The recording is saved and still waiting, so the next try reuses it.
//   3. "Go topic-free" removes the topic and tries again straight away; "Change topic" asks for a new one first.
import {useState} from "react";
import {useRouter} from "next/navigation";
import TopicDialog from "@/components/topic/topic-dialog";
import TopicRejectedDialog from "@/components/topic/topic-rejected-dialog";
import {createClient} from "@/lib/supabase";
import uploadRecording, {analyzeRecording, TopicRejectedError} from "@/lib/upload-recording";
import type {ImpromptuInfo} from "@/lib/impromptu/topics";
import {quickTopicProblem} from "@/lib/topic/check-topic";

export const ANALYZING_MESSAGE = "Analyzing...this can take a few minutes.";

export function useGetFeedback({file, impromptu, script, redoOf, redoTopic, askOnStart, holdTopicPopup, setBusy, setMessage}: {
    file: File | null;
    impromptu?: ImpromptuInfo | null; // impromptu runs already have a topic, so a typed topic and script are ignored
    script?: string | null; // the pasted script, if any
    redoOf?: string | null; // the earlier recording this take redoes, if any
    redoTopic?: string | null; // that take's typed topic (undefined when not redoing); used until the speaker changes it
    askOnStart: boolean; // open the topic popup as soon as the page loads
    holdTopicPopup?: boolean; // keep the topic popup shut (a redo is loading its own topic)
    setBusy: (busy: boolean) => void;
    setMessage: (message: string) => void;
}) {
    const supabase = createClient();
    const router = useRouter();
    const [ownTopic, setTopic] = useState<string | null | undefined>(undefined); // undefined = not touched yet
    const topic = ownTopic !== undefined ? ownTopic : redoTopic ?? null;
    const [answered, setDecided] = useState(false); // answered the topic popup at least once
    const decided = answered || redoTopic !== undefined; // a redo brings its own topic (or none)
    const [asking, setAsking] = useState(askOnStart);
    const [retrying, setRetrying] = useState(false); // topic popup opened from the "can't evaluate" popup
    const [rejection, setRejection] = useState<string | null>(null);
    // a recording that was uploaded but held back because of its topic; only reused for the same file
    const [held, setHeld] = useState<{file: File; id: string} | null>(null);
    const heldId = held && held.file === file ? held.id : null;

    async function getFeedback(chosen: string | null = topic) {
        if (!file) return;
        const sendTopic = impromptu ? null : chosen;
        setMessage("");
        if (sendTopic) {
            const problem = quickTopicProblem(sendTopic);
            if (problem) {
                setRejection(problem);
                return;
            }
        }
        const extras = {topic: sendTopic, script: impromptu ? null : script, redoOf};
        setBusy(true);
        try {
            let id = heldId;
            if (id) {
                setMessage(ANALYZING_MESSAGE);
                await analyzeRecording(id, extras);
            } else {
                id = await uploadRecording(supabase, file, () => setMessage(ANALYZING_MESSAGE), impromptu, extras);
            }
            // stays "busy" (the waiting screen) while the results page opens
            router.push(`/history/${id}`);
        } catch (err) {
            setBusy(false);
            if (err instanceof TopicRejectedError) {
                setHeld({file, id: err.recordingId});
                setMessage("");
                setRejection(err.message);
                return;
            }
            setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
    }

    function choose(next: string | null) {
        setTopic(next);
        setDecided(true);
        setAsking(false);
        if (retrying) {
            setRetrying(false);
            getFeedback(next);
        }
    }

    function ask() {
        setRetrying(false);
        setAsking(true);
    }

    function removeTopic() {
        setTopic(null);
        setDecided(true);
    }

    const dialogs = (
        <>
            <TopicDialog open={asking && !holdTopicPopup} initial={topic ?? ""} retrying={retrying} onChoose={choose}
                onDismiss={() => { setAsking(false); setRetrying(false); setDecided(true); }} />
            <TopicRejectedDialog open={rejection !== null} topic={topic} reason={rejection ?? ""}
                onTopicFree={() => { setRejection(null); removeTopic(); getFeedback(null); }}
                onChangeTopic={() => { setRejection(null); setRetrying(true); setAsking(true); }}
                onDismiss={() => setRejection(null)} />
        </>
    );

    return {topic, decided, ask, removeTopic, getFeedback, dialogs};
}
