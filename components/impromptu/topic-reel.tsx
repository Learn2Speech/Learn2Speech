"use client"; // runs the reel animation in the browser
// Impromptu: the topic, and the reel that spins when a new one is drawn. A column of topics scrolls up
// fast and slows down (the house ease-out) until it lands on the new topic, ticking softly as each one
// passes, then the topic settles with a small pop. The real topic text stays underneath (invisible while
// the reel runs), so the layout never jumps and screen readers only hear the new topic, once.
// Drawn a few times a session, so it may take ~0.75 s (the delight tier in /l2s). With reduced motion the
// reel is skipped and the topic just fades in. Web Animations API: no library, interruptible (a new draw
// cancels the running reel and starts from the topic on screen).
import {useEffect, useRef, useState} from "react";
import {playSound} from "@/components/ui-sounds";
import {TOPICS} from "@/lib/impromptu/topics";
import {cn} from "@/lib/utils";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // the house ease (globals.css)
const SPIN_MS = 750;
const FILLERS = 6; // topics that fly past between the old one and the new one

// the old topic, a few others, then the new one (picked from the list by position, so rendering stays pure)
function buildReel(from: string, to: string): string[] {
    const start = Math.max(0, TOPICS.indexOf(to as (typeof TOPICS)[number]));
    const others = Array.from({length: FILLERS}, (_, k) => TOPICS[(start + 7 * (k + 1)) % TOPICS.length] as string)
        .map((t) => (t === to || t === from ? TOPICS[(TOPICS.indexOf(t as (typeof TOPICS)[number]) + 1) % TOPICS.length] : t));
    return [from || others[0], ...others, to];
}

export default function TopicReel({topic, className}: {topic: string; className?: string}) {
    const [shown, setShown] = useState(topic);
    const [reel, setReel] = useState<string[] | null>(null);
    const [fade, setFade] = useState(false); // reduced motion: fade instead of spin
    // a new topic arrived: set up the reel (adjusting state while rendering, React's pattern for "prop changed")
    if (topic !== shown) {
        setShown(topic);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setReel(reduce ? null : buildReel(shown, topic));
        setFade(reduce);
    }
    const boxRef = useRef<HTMLParagraphElement>(null);
    const columnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const box = boxRef.current;
        if (fade && box) {
            const a = box.animate([{opacity: 0}, {opacity: 1}], {duration: 200, easing: EASE});
            return () => a.cancel();
        }
        const column = columnRef.current;
        if (!reel || !column || !box) return;
        const h = box.offsetHeight;
        column.style.setProperty("--row", `${h}px`);
        const steps = reel.length - 1;
        const spin = column.animate(
            [{transform: "translateY(0)"}, {transform: `translateY(${-steps * h}px)`}],
            {duration: SPIN_MS, easing: EASE, fill: "forwards"},
        );
        // a tick as each topic passes the window: the ease-out is close to 1-(1-t)^5, so topic k passes at
        // t = 1-(1-k/steps)^(1/5). Pitch climbs a little toward the landing.
        const ticks = Array.from({length: steps}, (_, i) => {
            const k = i + 1;
            return setTimeout(() => playSound("tick", 0.3 + (0.5 * k) / steps), SPIN_MS * (1 - Math.pow(1 - k / steps, 1 / 5)));
        });
        let pop: Animation | undefined;
        spin.onfinish = () => {
            setReel(null);
            pop = box.animate(
                [{transform: "scale(0.97)"}, {transform: "scale(1.015)", offset: 0.6}, {transform: "none"}],
                {duration: 260, easing: EASE},
            );
        };
        return () => {
            spin.cancel();
            pop?.cancel();
            ticks.forEach(clearTimeout);
        };
    }, [reel, fade]);

    return (
        <div className="relative">
            {/* the real topic: sizes the box and is what screen readers hear (once, when it changes) */}
            <p ref={boxRef} aria-live="polite" className={cn("origin-left", className, reel && "invisible")}>{topic}</p>
            {reel && (
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(transparent,#000_25%,#000_75%,transparent)]">
                    <div ref={columnRef} className="will-change-transform">
                        {reel.map((t, i) => (
                            <p key={i} className={cn(className, "h-(--row) overflow-hidden", i < reel.length - 1 && "text-muted-foreground")}>{t}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
