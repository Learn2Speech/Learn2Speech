"use client";
// Live filler counter: the on/off switch shown before recording, with one short line saying what it does and
// that we keep nothing. Where the audio goes (the device or the browser's speech service) is in the Privacy Policy.
// Starts on for Impromptu and off for free practice (see use-live-fillers.ts); the switch changes it.
import type {LiveFillers} from "@/components/live-fillers/use-live-fillers";
import SwitchToggle from "@/components/ui/switch-toggle";


export default function LiveFillerToggle({live, locked}: {live: LiveFillers; locked: boolean}) {
    if (live.support === null) return null; // still checking
    if (live.support === "none") {
        return <p className="text-sm text-muted-foreground">The live filler counter isn&apos;t available in this browser. Try Chrome or Edge.</p>;
    }
    return (
        <div className="max-w-[60ch]">
            <SwitchToggle on={live.enabled} onChange={live.toggle} disabled={locked || live.preparing} describedBy="live-filler-where"
                label={<>
                    <span>{live.preparing ? "Getting the live filler counter ready..." : "Live filler counter"}</span>
                    <span aria-hidden="true" className="text-muted-foreground">{live.enabled ? "On" : "Off"}</span>
                </>} />
            <p id="live-filler-where" className="mt-1 text-sm text-muted-foreground">Counts filler words (um, uh, etc.) while you speak. We never save what it hears.</p>
        </div>
    );
}
