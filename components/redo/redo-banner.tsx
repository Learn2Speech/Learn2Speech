// Redo a speech: the line at the top of Record / Upload while redoing an earlier take.
import {Repeat, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {RedoInfo} from "@/lib/redo/load-redo";

export default function RedoBanner({redo, onCancel, locked}: {redo: RedoInfo; onCancel: () => void; locked?: boolean}) {
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-brand/40 bg-accent px-4 py-3 text-accent-foreground">
            <p className="flex min-w-0 items-center gap-2">
                <Repeat className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">
                    Redoing <span className="font-semibold">{redo.name}</span>. Your results will put the two takes side by side.
                </span>
            </p>
            {!locked && (
                <Button type="button" variant="ghost" onClick={onCancel} className="h-10"><X /> Stop redoing</Button>
            )}
        </div>
    );
}
