"use client";
// Pops up when the Record page opens: the user says a few words and sees a green check once
// the microphone is clearly picking them up, or skips straight to recording.
// The test sound is never saved or sent; the mic is switched off when the popup closes.
import {useEffect, useRef, useState} from "react";
import {CircleCheck, Mic} from "lucide-react";
import {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import VolumeBars from "@/components/record/volume-bars";

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

    function close() {
        setOpen(false);
        setStream(null);
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Check your microphone</DialogTitle>
                    <DialogDescription>
                        {stream ? "Say a few words at your normal speaking volume." : "Make sure we can hear you before you record. Nothing from this test is saved."}
                    </DialogDescription>
                </DialogHeader>
                {stream && (
                    <div className="flex items-center gap-4">
                        <VolumeBars stream={stream} onHeard={() => setHeard(true)} />
                        <p aria-live="polite" className="text-sm">
                            {heard ? (
                                <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                                    <CircleCheck className="size-6" /> You&apos;re good to go!
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Listening...</span>
                            )}
                        </p>
                    </div>
                )}
                {error && <AuthMessage kind="error">{error}</AuthMessage>}
                <DialogFooter>
                    {heard ? (
                        <Button onClick={close}>Start recording</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={close}>Skip</Button>
                            {!stream && <Button onClick={test}><Mic /> Test microphone</Button>}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
