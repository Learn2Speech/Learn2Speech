"use client"; // needs clicks and the browser's Supabase login
// History: "Start chart fresh" makes the progress charts count only recordings from now on, after a confirm
// popup. Nothing is deleted: every recording stays in History, and "Bring back old points" undoes it.
// The start date is saved in the user's account (auth user_metadata.chart_start), so it follows them across
// devices without a database change. The History page reads it and filters the chart points.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Undo2 } from "lucide-react";
import { AuthMessage } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DIALOG_CLASS } from "@/components/topic/topic-dialog";
import { createClient } from "@/lib/supabase";

export default function ChartReset({ chartStart, hiddenCount }: { chartStart: string | null; hiddenCount: number }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function save(start: string | null) {
    setSaving(true);
    setErrorMessage("");
    const { error } = await createClient().auth.updateUser({ data: { chart_start: start } });
    setSaving(false);
    if (error) return setErrorMessage("Couldn't save that. Please try again.");
    setOpen(false);
    router.refresh(); // the page re-reads the start date and redraws the chart
  }

  if (chartStart) {
    const day = new Date(chartStart).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>Chart started fresh on {day}{hiddenCount > 0 && ` (${hiddenCount} earlier ${hiddenCount === 1 ? "recording" : "recordings"} not counted)`}.</span>
        <Button variant="ghost" onClick={() => save(null)} disabled={saving} className="h-11 text-foreground">
          <Undo2 /> {saving ? "Bringing back..." : "Bring back old points"}
        </Button>
        {errorMessage && <span role="alert" className="text-destructive">{errorMessage}</span>}
      </div>
    );
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="h-11">
        <RotateCcw /> Start chart fresh
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!saving) setOpen(value); }}>
        <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Start your chart fresh?</DialogTitle>
            <DialogDescription className="text-base">
              Your progress chart will only count recordings from now on. Nothing is deleted: every recording stays in
              History, and you can bring the old points back any time.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving} className="h-12 border-foreground/30! px-6 text-base">Cancel</Button>
            <Button onClick={() => save(new Date().toISOString())} disabled={saving} className="h-12 px-6 text-base">
              {saving ? "Saving..." : "Start fresh"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
