"use client";
// Topic mode: the popup that asks what the speech is about, with a "Go topic-free" way out.
// Opens when the Upload page loads, and on Record (free practice) right after the microphone check.
// Styled like the mic check (components/record/mic-check.tsx): flat frame, 8px radius, 48px buttons, house ease.
// No checking happens here on purpose: the topic is checked when the speaker presses "Get feedback".
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cleanTopic, MAX_TOPIC_LENGTH} from "@/lib/topic/check-topic";

export const DIALOG_CLASS = "gap-6 rounded-lg p-6 ring-border duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none sm:max-w-md";

export default function TopicDialog({open, initial, retrying, onChoose, onDismiss}: {
    open: boolean;
    initial: string; // the current topic, so "Change topic" starts from it
    retrying: boolean; // opened from the "can't evaluate that topic" popup: choosing also gets feedback
    onChoose: (topic: string | null) => void; // null = topic-free
    onDismiss: () => void; // Escape or clicking outside: keep things as they are
}) {
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
            <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
                {/* its own component, so the typed text starts fresh each time the popup opens */}
                <TopicForm initial={initial} retrying={retrying} onChoose={onChoose} />
            </DialogContent>
        </Dialog>
    );
}

function TopicForm({initial, retrying, onChoose}: {initial: string; retrying: boolean; onChoose: (topic: string | null) => void}) {
    const [draft, setDraft] = useState(initial);
    const cleaned = cleanTopic(draft);
    return (
        <form onSubmit={(e) => { e.preventDefault(); if (cleaned) onChoose(cleaned); }} className="grid gap-6">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">
                    {retrying ? "Try a different topic" : "What's your speech about?"}
                </DialogTitle>
                <DialogDescription className="text-base">
                    {retrying
                        ? "Describe your speech in a few words and we'll get your feedback. Or go topic-free for general feedback."
                        : "Add a topic and we'll set your pace target and tips for that kind of speech. Or go topic-free for general feedback."}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
                <Label htmlFor="speech-topic" className="text-sm font-medium">Topic</Label>
                <Input id="speech-topic" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_TOPIC_LENGTH}
                    autoComplete="off" placeholder="Example: Why our school should start later"
                    aria-describedby="speech-topic-count" className="h-12 px-3 text-base md:text-base" />
                <p id="speech-topic-count" className="text-sm text-muted-foreground tabular-nums">{draft.length} of {MAX_TOPIC_LENGTH} characters</p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => onChoose(null)} className="h-12 border-foreground/30! px-6 text-base">
                    Go topic-free
                </Button>
                <Button type="submit" disabled={!cleaned} className="h-12 px-6 text-base">
                    {retrying ? "Use this topic and get feedback" : "Use this topic"}
                </Button>
            </div>
        </form>
    );
}
