"use client";
// Redo a speech: reads ?redo=<id> from the address bar and loads the earlier take (lib/redo/load-redo.ts).
// The page uses the loaded take's topic, script and impromptu settings until the speaker changes them.
import {useEffect, useState, useSyncExternalStore} from "react";
import {createClient} from "@/lib/supabase";
import {loadRedo, redoIdFromUrl, type RedoInfo} from "@/lib/redo/load-redo";

const noSubscribe = () => () => {};
const onServer = () => null;
// marks "looked it up, but it isn't there (or isn't yours, or isn't finished)", so loading can end
const MISSING: RedoInfo = {id: "", name: "", impromptu: null, topic: null, script: null};

export function useRedo() {
    // the id in the address bar (null on the server and when there isn't one)
    const redoId = useSyncExternalStore(noSubscribe, redoIdFromUrl, onServer);
    const [redo, setRedo] = useState<RedoInfo | null>(null);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        if (!redoId) return;
        let alive = true;
        loadRedo(createClient(), redoId).then((info) => {
            if (alive) setRedo(info ?? MISSING);
        });
        return () => { alive = false; };
    }, [redoId]);

    function cancel() {
        setCancelled(true);
        // drop ?redo= from the address bar without reloading, so a refresh starts a normal practice
        window.history.replaceState(null, "", window.location.pathname);
    }

    const active = cancelled || redo === MISSING ? null : redo;
    return {
        redo: active,
        // true while a redo is being loaded: keeps the topic popup from flashing up first
        loading: Boolean(redoId) && redo === null && !cancelled,
        cancel,
    };
}
