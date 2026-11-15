"use client"; // reads the browser's microphone permission
// The browser itself asks "Allow microphone?" the first time a site wants it (we can't draw or skip that
// prompt). What we can do, like most recording sites, is: ask only when the user presses Start or
// Check mic (never on page load), say beforehand that the prompt is coming, and if they blocked it,
// say exactly how to turn it back on. The Permissions API tells us which of the three it is; browsers
// that don't support it just show nothing extra.
import {useEffect, useState} from "react";
import {Mic, MicOff} from "lucide-react";

export const MIC_BLOCKED =
    "Your browser is blocking the microphone for this site. Click the icon to the left of the web address, set Microphone to Allow, then reload the page.";

export function useMicPermission() {
    const [state, setState] = useState<PermissionState | null>(null);
    useEffect(() => {
        let status: PermissionStatus | undefined;
        let gone = false;
        navigator.permissions?.query({name: "microphone" as PermissionName})
            .then((s) => {
                if (gone) return;
                status = s;
                setState(s.state);
                s.onchange = () => setState(s.state); // updates as soon as they answer the prompt
            })
            .catch(() => {}); // e.g. Firefox before it knew "microphone": show nothing
        return () => {
            gone = true;
            if (status) status.onchange = null;
        };
    }, []);
    return state;
}

export function MicPermissionNote({state}: {state: PermissionState | null}) {
    if (state === "prompt") {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="size-4 shrink-0" aria-hidden="true" /> Your browser will ask to use your microphone. Choose Allow.
            </p>
        );
    }
    if (state === "denied") {
        return (
            <p className="flex max-w-[60ch] items-start gap-2 text-sm text-destructive" role="status">
                <MicOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {MIC_BLOCKED}
            </p>
        );
    }
    return null; // allowed already, or we can't tell
}
