"use client";
// Pops up when the Record page opens: the user says a few words and sees a green check once
// the microphone is clearly picking them up, or skips straight to recording.
// The test sound is never saved or sent; the mic is switched off when the popup closes.
// Styled to DESIGN.md: flat (hairline frame, no blur or shadow), 8px radius, 48px main buttons, the house ease.
import {useEffect, useRef, useState} from "react";
import {CircleCheck, Mic} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import VolumeBars from "@/components/record/volume-bars";
import {playSound} from "@/components/ui-sounds";

export default function MicCheck() {
    const [open, setOpen] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [heard, setHeard] = useState(false);
    const [error, setError] = useState("");
    // true once the popup is closed, so a mic allowed after closing gets switched straight off
    const closedRef = useRef(false);

    // switch the mic off when the popup closes or the page is left
    useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
    useEffect(() => { closedRef.current = !open; }, [open]);

    async function test() {
        setError("");
        let s: MediaStream;
        try {
            s = await navigator.mediaDevices.getUserMedia({audio: true});
        } catch {
            setError("We couldn't use your microphone. Allow microphone access in your browser and try again.");
            return;
        }
        if (closedRef.current) s.getTracks().forEach((t) => t.stop());
        else setStream(s);
    }

    function onHeard() {
        setHeard(true);
        playSound("tick", 1); // a soft high tick that sits on the check appearing (muted with the top-bar switch)
    }

    function close() {
        setOpen(false);
        setStream(null);
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent showCloseButton={false}
                className="gap-6 rounded-lg p-6 ring-border duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Check your microphone</DialogTitle>
                    <DialogDescription className="text-base">
                        {stream ? "Say a few words at your normal speaking volume." : "Make sure we can hear you before you record. Nothing from this test is saved."}
                    </DialogDescription>
                </DialogHeader>
                {stream && (
                    <div className="flex items-center gap-4">
                        <VolumeBars stream={stream} onHeard={onHeard} />
                        <p aria-live="polite">
                            {heard ? (
                                // same success green as AuthMessage
                                <span className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
                                    <CircleCheck className="pop-in size-6" /> You&apos;re good to go!
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Listening...</span>
                            )}
                        </p>
                    </div>
                )}
                {error && <AuthMessage kind="error">{error}</AuthMessage>}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    {heard ? (
                        <Button onClick={close} className="h-12 px-6 text-base">Done</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={close} className="h-12 px-6 text-base">Skip</Button>
                            {!stream && <Button onClick={test} className="h-12 px-6 text-base"><Mic /> Test microphone</Button>}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
