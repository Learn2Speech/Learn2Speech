"use client";
// Topic mode: the popup shown when "Get feedback" finds the topic can't be evaluated (a keysmash, gibberish,
// "idk"...). "Go topic-free" removes the topic and gets general feedback right away; "Change topic" reopens
// the topic popup. Nothing was transcribed yet, so neither choice wastes an analysis.
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DIALOG_CLASS} from "@/components/topic/topic-dialog";

export default function TopicRejectedDialog({open, topic, reason, onTopicFree, onChangeTopic, onDismiss}: {
    open: boolean;
    topic: string | null;
    reason: string;
    onTopicFree: () => void;
    onChangeTopic: () => void;
    onDismiss: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
            <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">We can&apos;t evaluate that topic</DialogTitle>
                    <DialogDescription className="text-base">{reason}</DialogDescription>
                </DialogHeader>
                {topic && (
                    // shakes once (the same error shake as form errors; off with reduced motion)
                    <p className="shake rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
                        <span className="block text-sm text-muted-foreground">Your topic</span>
                        <span className="block font-medium break-words">{topic}</span>
                    </p>
                )}
                <p className="text-muted-foreground">Go topic-free to remove it and get general feedback now, or change it.</p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={onChangeTopic} className="h-12 border-foreground/30! px-6 text-base">Change topic</Button>
                    <Button onClick={onTopicFree} className="h-12 px-6 text-base">Go topic-free</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
