"use client";
// Script mode: the pasted script and its popup, for the Record and Upload pages.
import {useState} from "react";
import ScriptDialog from "@/components/script/script-dialog";

// redoScript: the earlier take's script when redoing one (undefined when not redoing). It's used until the
// speaker edits or removes the script themselves.
export function useScript(redoScript?: string | null) {
    const [ownScript, setScript] = useState<string | null | undefined>(undefined); // undefined = not touched yet
    const script = ownScript !== undefined ? ownScript : redoScript ?? null;
    const [editing, setEditing] = useState(false);

    const dialog = (
        <ScriptDialog open={editing} initial={script ?? ""}
            onSave={(next) => { setScript(next); setEditing(false); }}
            onDismiss={() => setEditing(false)} />
    );

    return {
        script,
        edit: () => setEditing(true),
        remove: () => setScript(null),
        dialog,
    };
}
