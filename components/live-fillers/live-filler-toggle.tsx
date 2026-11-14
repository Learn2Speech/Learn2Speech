"use client";
// Live filler counter: the on/off switch shown before recording, with a plain line saying where the
// audio goes for live counting (on the device, or the browser's own speech service). Off by default.
import type {LiveFillers} from "@/components/live-fillers/use-live-fillers";

const WHERE: Record<"on-device" | "downloadable" | "cloud", string> = {
    "on-device": "Counts ums while you speak. Runs on your device, so nothing extra is sent anywhere.",
    "downloadable": "Counts ums while you speak. Runs on your device after a one-time download of your browser's English speech pack.",
    "cloud": "Counts ums while you speak. Your browser sends your audio to its own speech service (Google in Chrome, Microsoft in Edge) to do this. We never receive or save that text.",
};

export default function LiveFillerToggle({live, locked}: {live: LiveFillers; locked: boolean}) {
    if (live.support === null) return null; // still checking
    if (live.support === "none") {
        return <p className="text-sm text-muted-foreground">The live filler counter isn&apos;t available in this browser. Try Chrome or Edge.</p>;
    }
    return (
        <div className="max-w-[60ch]">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={live.enabled} disabled={locked || live.preparing}
                    onChange={(e) => live.toggle(e.target.checked)} aria-describedby="live-filler-where"
                    className="size-4 accent-(--orange)" />
                {live.preparing ? "Getting the live filler counter ready..." : "Live filler counter"}
            </label>
            <p id="live-filler-where" className="mt-1 text-sm text-muted-foreground">{WHERE[live.support]}</p>
        </div>
    );
}
