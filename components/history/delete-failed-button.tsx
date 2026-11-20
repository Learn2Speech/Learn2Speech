"use client"; // needs clicks and the browser's Supabase login
// History: "Delete failed" removes every recording whose analysis failed (row and audio file), after a
// confirm popup. A button, not automatic: a failed recording can still be retried from its results page.
// Same order as deleting one recording: files first, then rows, so a failure part-way can simply be tried
// again (removing a missing file is fine) and no file is left that nobody can see but still counts toward
// the storage limit. Only rows still "failed" are touched. RLS keeps it all to the user's own data.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AuthMessage } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DIALOG_CLASS } from "@/components/topic/topic-dialog";
import { createClient } from "@/lib/supabase";

export default function DeleteFailedButton({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const count = `${ids.length} failed ${ids.length === 1 ? "recording" : "recordings"}`;

  async function deleteFailed() {
    setDeleting(true);
    setErrorMessage("");
    const supabase = createClient();
    const { data: failed, error } = await supabase.from("recordings").select("file_path").in("id", ids).eq("status", "failed");
    const { error: fileError } = error || !failed.length ? { error } : await supabase.storage.from("recordings").remove(failed.map((row) => row.file_path));
    const { error: rowError } = error || fileError ? { error: true } : await supabase.from("recordings").delete().in("id", ids).eq("status", "failed");
    setDeleting(false);
    if (rowError) return setErrorMessage("Couldn't delete them. Please try again.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Trash2 /> Delete failed ({ids.length})
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!deleting) setOpen(value); }}>
        <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Delete {count}?</DialogTitle>
            <DialogDescription className="text-base">
              This permanently deletes their audio. They have no feedback, and your other recordings stay. You can&apos;t undo it.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting} className="h-12 border-foreground/30! px-6 text-base">Cancel</Button>
            <Button variant="destructive" onClick={deleteFailed} disabled={deleting} className="h-12 px-6 text-base">
              {deleting ? "Deleting..." : "Yes, delete them"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
