"use client"; // remembers the switch while you're on the page
// History: an optional "Keep chart in view" switch that pins the progress chart under the top bar while the
// list scrolls. Off by default, and only on wide screens (lg+): on phones a pinned chart would cover most of
// the screen, so the switch isn't shown there. Not remembered between visits on purpose (no browser storage).
import { useState } from "react";
import SwitchToggle from "@/components/ui/switch-toggle";
import { cn } from "@/lib/utils";

// toolbar: shown on the left of the switch row (History puts "Start chart fresh" there)
export default function PinnableChart({ canPin, toolbar, children }: { canPin: boolean; toolbar?: React.ReactNode; children: React.ReactNode }) {
  const [pinned, setPinned] = useState(false);
  return (
    <div className={cn("mb-16 flex flex-col", pinned && "lg:sticky lg:top-14 lg:z-10 lg:border-b lg:bg-background lg:pb-4")}>
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <div>{toolbar}</div>
        {canPin && <SwitchToggle on={pinned} onChange={setPinned} label="Keep chart in view" className="max-lg:hidden" />}
      </div>
      {children}
    </div>
  );
}
