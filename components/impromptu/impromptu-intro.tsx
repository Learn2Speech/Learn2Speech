"use client"; // remembers on this device that the intro was seen
// Impromptu: the "How impromptu works" popup. Opens by itself the first time someone visits /impromptu
// (remembered on this device under "l2s-impromptu-intro"), and again from the "How impromptu works" button.
// Closing it draws the first topic.
// Styled like the other popups (DIALOG_CLASS): flat frame, 8px radius, 48px button, house ease.
import {useState, useSyncExternalStore} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DIALOG_CLASS} from "@/components/topic/topic-dialog";

const KEY = "l2s-impromptu-intro";
const listeners = new Set<() => void>();
let seenThisVisit = false; // when browser storage is blocked, at least don't show it twice in one visit

function seen() {
    try {
        return localStorage.getItem(KEY) === "seen" || seenThisVisit;
    } catch {
        return seenThisVisit;
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const STEPS = [
    {title: "Get a topic", text: "A random question to speak about. Don't like it? Press New topic."},
    {title: "Pick your length", text: "Anywhere from 30 seconds to 5 minutes, with the - and + buttons."},
    {title: "Think, then speak", text: "You get 30 seconds to plan (you can turn this off). Recording starts by itself and the clock counts down."},
    {title: "Get feedback", text: "Besides pace and filler words, we check if you stayed on topic, how you built your answer, and how you used your time."},
];

export function useImpromptuIntro(onClose?: () => void) {
    // null on the server (we can't know yet), so nothing pops up until the browser has checked
    const wasSeen = useSyncExternalStore(subscribe, seen, () => null);
    const [reopened, setReopened] = useState(false);
    const open = wasSeen === false || reopened;

    function close() {
        seenThisVisit = true;
        try {
            localStorage.setItem(KEY, "seen");
        } catch {}
        setReopened(false);
        listeners.forEach((listener) => listener());
        onClose?.();
    }

    const dialog = (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">How impromptu works</DialogTitle>
                    <DialogDescription className="text-base">
                        Impromptu means speaking with almost no time to prepare, like the impromptu event in speech and debate.
                        It trains you to think on your feet.
                    </DialogDescription>
                </DialogHeader>
                <ol className="divide-y border-y">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className="grid grid-cols-[auto_1fr] gap-x-4 py-3">
                            <span aria-hidden="true" className="text-3xl leading-[0.9] font-black text-(--brand) tabular-nums">{i + 1}</span>
                            <div>
                                <p className="font-semibold">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <Button onClick={close} className="h-12 px-6 text-base sm:justify-self-end">Got it</Button>
            </DialogContent>
        </Dialog>
    );

    return {show: () => setReopened(true), dialog};
}
