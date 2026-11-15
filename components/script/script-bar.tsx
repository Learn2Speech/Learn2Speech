"use client";
// Script mode: the one-line "Script" row on Record (free practice) and Upload, under the topic row.
// No script: an "Add a script" button. With one: its word count, Edit / Remove, and a
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
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Script (optional)</p>
                    {script
                        ? <p className="text-lg leading-snug"><span className="font-semibold tabular-nums">{countWords(script)}</span> words</p>
                        : <p className="text-lg leading-snug">None yet</p>}
                </div>
                {!locked && (
                    <div className="flex shrink-0 gap-1">
                        {script ? (
                            <>
                                <Button type="button" variant="outline" onClick={onEdit} className="h-10 border-foreground/30!"><Pencil /> Edit</Button>
                                <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove script" title="Remove script" className="size-10"><X /></Button>
                            </>
                        ) : (
                            <Button type="button" variant="outline" onClick={onEdit} className="h-10 border-foreground/30!"><FileText /> Add a script</Button>
                        )}
                    </div>
                )}
            </div>
            {script && (
                // readable while recording; collapsed by default so the clock stays in view
                <details className="mt-3 w-full rounded-lg border px-4 py-3">
                    <summary className="cursor-pointer font-medium">Show my script</summary>
                    <div className="mt-3 max-h-72 overflow-y-auto pr-2 text-lg leading-relaxed whitespace-pre-line">{script}</div>
                </details>
            )}
        </div>
    );
}
