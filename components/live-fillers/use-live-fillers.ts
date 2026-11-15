"use client";
// Live filler counter: the hook behind the toggle and the counter on the Record page.
// Default per mode (the Record page decides): ON for Impromptu, OFF for free practice, and the speaker can flip
// it either way with the switch. A preset ON only applies when the browser recognizes speech on the device;
// if it would have to send audio to the browser's speech service, it stays off until the speaker turns it on
// after reading where the audio goes. When it's on, the browser's speech recognition listens while you record and we count
// the filler words in what it hears. It's an estimate: browsers sometimes leave "um" out of their text.
// The exact count still comes from the full analysis afterwards.
import {useEffect, useState} from "react";
import {addCounts, countFillers, totalOf, type FillerCounts} from "@/lib/live-fillers/count-fillers";
import {checkLiveSupport, createRecognition, installOnDevice, type LiveSupport} from "@/lib/live-fillers/speech-recognition";

// Errors that mean "this won't work right now": stop trying and tell the speaker. Others (no speech, aborted) are normal.
const FATAL: Record<string, string> = {
    "not-allowed": "The live counter needs microphone permission. Your recording still works.",
    "service-not-allowed": "Your browser's speech service isn't available, so the live counter is off. Your recording still works.",
    "network": "Your browser's speech service couldn't be reached, so the live counter is off. Your recording still works.",
    "language-not-supported": "Your browser can't recognize English live, so the live counter is off. Your recording still works.",
    "audio-capture": "The live counter couldn't hear your microphone. Your recording still works.",
};

// listening: recording right now. presetOn: this mode starts with the counter on. mode: which mode the
// speaker's own choice belongs to (switching Impromptu off doesn't switch free practice off, and the other way).
export function useLiveFillers(listening: boolean, {presetOn, mode}: {presetOn: boolean; mode: string}) {
    const [support, setSupport] = useState<LiveSupport | null>(null); // null while checking
    const [choices, setChoices] = useState<Record<string, boolean>>({}); // the speaker's own on/off, per mode
    const enabled = choices[mode] ?? (presetOn && support === "on-device");
    const setEnabled = (on: boolean) => setChoices((c) => ({...c, [mode]: on}));
    const [preparing, setPreparing] = useState(false); // downloading the on-device language pack
    const [finalCounts, setFinalCounts] = useState<FillerCounts>({});
    const [interimCounts, setInterimCounts] = useState<FillerCounts>({});
    const [problem, setProblem] = useState("");

    // what this browser can do, checked once
    useEffect(() => {
        let alive = true;
        checkLiveSupport().then((s) => { if (alive) setSupport(s); });
        return () => { alive = false; };
    }, []);

    // listen only while recording AND switched on
    useEffect(() => {
        if (!listening || !enabled || !support || support === "none") return;
        const recognition = createRecognition(support === "on-device");
        if (!recognition) return;
        let done = false;
        let fresh = true;
        let restarts = 0;
        recognition.onstart = () => {
            // a new take starts from zero (only the first start; restarts below keep counting)
            if (fresh) {
                fresh = false;
                setFinalCounts({});
                setInterimCounts({});
                setProblem("");
            }
        };
        recognition.onresult = (event) => {
            const finished: string[] = [];
            let pending = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) finished.push(result[0].transcript);
                else pending += ` ${result[0].transcript}`;
            }
            if (finished.length > 0) setFinalCounts((counts) => addCounts(counts, countFillers(finished.join(" "))));
            setInterimCounts(countFillers(pending));
        };
        recognition.onerror = (event) => {
            if (FATAL[event.error]) {
                done = true;
                setProblem(FATAL[event.error]);
            }
        };
        // browsers stop listening after a silence or about a minute: start again until the take ends
        recognition.onend = () => {
            setInterimCounts({});
            if (!done && restarts < 100) {
                restarts++;
                try { recognition.start(); } catch { done = true; }
            }
        };
        try {
            recognition.start();
        } catch {
            done = true;
        }
        return () => {
            done = true;
            // stop (not abort) so the last words said still get counted
            try { recognition.stop(); } catch { /* already stopped */ }
        };
    }, [listening, enabled, support]);

    function toggle(on: boolean) {
        if (!on) {
            setEnabled(false);
            return;
        }
        if (support === "downloadable") {
            // one-time download of the on-device English pack; if it fails, the speaker sees the cloud wording and decides again
            setPreparing(true);
            installOnDevice().then((ok) => {
                setPreparing(false);
                if (ok) {
                    setSupport("on-device");
                    setEnabled(true);
                } else {
                    setSupport("cloud");
                }
            });
            return;
        }
        setEnabled(true);
    }

    const counts = addCounts(finalCounts, interimCounts);
    return {support, enabled, preparing, toggle, counts, total: totalOf(counts), problem};
}

export type LiveFillers = ReturnType<typeof useLiveFillers>;
