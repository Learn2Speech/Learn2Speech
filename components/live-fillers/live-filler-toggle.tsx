"use client";
// Live filler counter: the on/off switch shown before recording, with one short line saying what it does and
// that we keep nothing. Where the audio goes (the device or the browser's speech service) is in the Privacy Policy.
// Starts on for Impromptu and off for free practice (see use-live-fillers.ts); the switch changes it.
import type {LiveFillers} from "@/components/live-fillers/use-live-fillers";
import {cn} from "@/lib/utils";


export default function LiveFillerToggle({live, locked}: {live: LiveFillers; locked: boolean}) {
    if (live.support === null) return null; // still checking
    if (live.support === "none") {
        return <p className="text-sm text-muted-foreground">The live filler counter isn&apos;t available in this browser. Try Chrome or Edge.</p>;
    }
    return (
        <div className="max-w-[60ch]">
            {/* a switch: orange track when on (it can be pressed), a knob that slides across */}
            <button type="button" role="switch" aria-checked={live.enabled} disabled={locked || live.preparing}
                onClick={() => live.toggle(!live.enabled)} aria-describedby="live-filler-where"
                className="group flex min-h-11 cursor-pointer items-center gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50">
                <span aria-hidden="true"
                    className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150",
                        live.enabled ? "border-transparent bg-primary" : "border-foreground/30 bg-secondary")}>
                    <span className={cn("absolute left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                        live.enabled ? "translate-x-5" : "translate-x-0")} />
                </span>
                <span>{live.preparing ? "Getting the live filler counter ready..." : "Live filler counter"}</span>
                <span aria-hidden="true" className="text-muted-foreground">{live.enabled ? "On" : "Off"}</span>
            </button>
            <p id="live-filler-where" className="mt-1 text-sm text-muted-foreground">Counts filler words (um, uh, etc.) while you speak. We never save what it hears.</p>
        </div>
    );
}
