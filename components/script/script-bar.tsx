"use client";
// Script mode: the "Your script (optional)" line on Record (free practice) and Upload, under the topic.
// No script: an "Add your script" button. With one: its word count, Edit / Remove, and a
// "Show my script" fold-out the speaker can read from while recording.
import {FileText, Pencil, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {countWords} from "@/lib/script/compare-script";
import {cn} from "@/lib/utils";

export default function ScriptBar({script, onEdit, onRemove, locked, className}: {
    script: string | null;
    onEdit: () => void;
    onRemove: () => void;
    locked?: boolean;
    className?: string;
}) {
    return (
        <div className={cn("w-full", className)}>
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your script (optional)</p>
            {script ? (
                <>
                    <p className="mt-2 text-lg"><span className="font-semibold tabular-nums">{countWords(script)}</span> words. We&apos;ll compare it with what you say.</p>
                    {/* readable while recording; collapsed by default so the clock stays in view */}
                    <details className="mt-3 w-full rounded-lg border px-4 py-3">
                        <summary className="cursor-pointer font-medium">Show my script</summary>
                        <div className="mt-3 max-h-72 overflow-y-auto pr-2 text-lg leading-relaxed whitespace-pre-line">{script}</div>
                    </details>
                </>
            ) : (
                <p className="mt-2 max-w-[55ch] text-muted-foreground">Practicing a written speech? Add it and we&apos;ll show what you skipped, added and rushed.</p>
            )}
            {!locked && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {script ? (
                        <>
                            <Button type="button" variant="outline" onClick={onEdit} className="h-10 border-foreground/30!"><Pencil /> Edit script</Button>
                            <Button type="button" variant="ghost" onClick={onRemove} className="h-10"><X /> Remove script</Button>
                        </>
                    ) : (
                        <Button type="button" variant="outline" onClick={onEdit} className="h-10 border-foreground/30!"><FileText /> Add your script</Button>
                    )}
                </div>
            )}
        </div>
    );
}
