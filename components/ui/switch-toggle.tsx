"use client";
// An on/off switch with its label: orange track when on (it can be pressed), a knob that slides across.
// Used on History (Hide duplicates, Keep chart in view) and by the live filler counter.
import { cn } from "@/lib/utils";

export default function SwitchToggle({ on, onChange, label, disabled, describedBy, className }: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: React.ReactNode;
  disabled?: boolean;
  describedBy?: string; // id of a line that explains the switch
  className?: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} disabled={disabled} aria-describedby={describedBy}
      className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50", className)}>
      <span aria-hidden="true" className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150",
        on ? "border-transparent bg-primary" : "border-foreground/30 bg-secondary")}>
        <span className={cn("absolute left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          on ? "translate-x-5" : "translate-x-0")} />
      </span>
      {label}
    </button>
  );
}
