"use client";
// Live filler counter: the running count while recording ("4 fillers so far · um 3 · uh 1"), and the
// final estimate after you stop. Purely visual (the full results announce the real count), so it isn't
// read out on every change; screen readers get the total once recording stops.
import type {LiveFillers} from "@/components/live-fillers/use-live-fillers";

export default function LiveFillerCounter({live, recording}: {live: LiveFillers; recording: boolean}) {
    if (!live.enabled) return null;
    if (live.problem) return <p className="text-sm text-destructive">{live.problem}</p>;
    const words = Object.entries(live.counts).sort((a, b) => b[1] - a[1]);
    return (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="flex items-baseline gap-2">
                <span className="text-5xl leading-none font-black tracking-[-0.04em] text-(--brand) tabular-nums">{live.total}</span>
                <span className="text-muted-foreground">
                    {live.total === 1 ? "filler" : "fillers"} {recording ? "so far (live)" : "counted live"}
                </span>
            </p>
            {words.length > 0 && (
                <p className="text-sm text-muted-foreground tabular-nums">
                    {words.map(([word, n]) => `${word} ×${n}`).join(" · ")}
                </p>
            )}
            {!recording && (
                <p className="w-full text-sm text-muted-foreground" role="status">
                    A live estimate: your browser can miss some ums. Your results will have the exact count.
                </p>
            )}
        </div>
    );
}
