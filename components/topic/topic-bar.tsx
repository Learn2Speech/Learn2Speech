// Topic mode: the topic line above the Record and Upload buttons, with Change / Go topic-free
// (or "Add a topic" when there isn't one). Locked while recording or sending.
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
        <div className={cn("w-full", className)}>
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your topic</p>
            {topic ? (
                <p className="mt-2 max-w-[32ch] text-2xl leading-[1.15] font-semibold break-words sm:text-3xl">{topic}</p>
            ) : (
                <p className="mt-2 text-lg text-muted-foreground">Topic-free. You&apos;ll get general feedback.</p>
            )}
            {!locked && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {topic ? (
                        <>
                            <Button type="button" variant="outline" onClick={onChange} className="h-10 border-foreground/30!"><Pencil /> Change topic</Button>
                            <Button type="button" variant="ghost" onClick={onRemove} className="h-10"><X /> Go topic-free</Button>
                        </>
                    ) : (
                        <Button type="button" variant="outline" onClick={onChange} className="h-10 border-foreground/30!"><Plus /> Add a topic</Button>
                    )}
                </div>
            )}
        </div>
    );
}
