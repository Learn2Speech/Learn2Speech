// Topic mode: the one-line "Topic" row above the Record and Upload buttons, with Change / Go topic-free
// (or "Add a topic" when there isn't one). Locked while recording or sending.
// A compact row (value left, buttons right) so the main button stays on screen on phones.
import {Pencil, Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export default function TopicBar({topic, onChange, onRemove, locked, className}: {
    topic: string | null;
    onChange: () => void;
    onRemove: () => void;
    locked?: boolean;
    className?: string;
}) {
    return (
        <div className={cn("flex w-full items-center justify-between gap-4", className)}>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Topic</p>
                {topic
                    ? <p className="text-lg leading-snug font-semibold break-words">{topic}</p>
                    : <p className="text-lg leading-snug">None yet: general feedback</p>}
            </div>
            {!locked && (
                <div className="flex shrink-0 gap-1">
                    {topic ? (
                        <>
                            <Button type="button" variant="outline" onClick={onChange} className="h-10 border-foreground/30!"><Pencil /> Change</Button>
                            <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Go topic-free" title="Go topic-free" className="size-10"><X /></Button>
                        </>
                    ) : (
                        <Button type="button" variant="outline" onClick={onChange} className="h-10 border-foreground/30!"><Plus /> Add a topic</Button>
                    )}
                </div>
            )}
        </div>
    );
}
