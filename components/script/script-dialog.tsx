"use client";
// Script mode: the popup where the speaker pastes (or edits) the script they plan to say.
// Styled like the topic popup (components/topic/topic-dialog.tsx), a bit wider for the text box.
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {cleanScript, countWords} from "@/lib/script/compare-script";
import {MAX_SCRIPT_LENGTH} from "@/lib/script/types";

export default function ScriptDialog({open, initial, onSave, onDismiss}: {
    open: boolean;
    initial: string;
    onSave: (script: string | null) => void; // null = no script
    onDismiss: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
            <DialogContent showCloseButton={false}
                className="gap-6 rounded-lg p-6 ring-border duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none sm:max-w-2xl">
                {/* its own component, so the text starts fresh each time the popup opens */}
                <ScriptForm initial={initial} onSave={onSave} onCancel={onDismiss} />
            </DialogContent>
        </Dialog>
    );
}

function ScriptForm({initial, onSave, onCancel}: {initial: string; onSave: (script: string | null) => void; onCancel: () => void}) {
    const [draft, setDraft] = useState(initial);
    const words = countWords(draft);
    const enough = words >= 5;
    return (
        <form onSubmit={(e) => { e.preventDefault(); if (enough) onSave(cleanScript(draft)); }} className="grid gap-6">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Your script</DialogTitle>
                <DialogDescription className="text-base">
                    Paste what you plan to say. After you speak, we&apos;ll show what you skipped, what you added and which parts you rushed.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
                <Label htmlFor="speech-script" className="text-sm font-medium">Script</Label>
                <textarea id="speech-script" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_SCRIPT_LENGTH}
                    rows={12} aria-describedby="speech-script-count"
                    placeholder="Good morning everyone. Today I want to talk about..."
                    className="max-h-[50vh] min-h-48 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" />
                <p id="speech-script-count" className="text-sm text-muted-foreground tabular-nums">
                    {words} {words === 1 ? "word" : "words"} · {draft.length} of {MAX_SCRIPT_LENGTH} characters
                </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onCancel} className="h-12 border-foreground/30! px-6 text-base">Cancel</Button>
                <Button type="submit" disabled={!enough} className="h-12 px-6 text-base">Save script</Button>
            </div>
        </form>
    );
}
