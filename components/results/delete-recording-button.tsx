"use client"; // needs clicks, state and the browser's Supabase login
// "Delete recording" on a results page: asks to confirm, then removes the audio file from
// storage and the row (transcript, metrics, feedback) from the database, so users can
// erase their own data. The Row Level Security delete rules from Akshith's migrations
// only let people delete their own files and rows.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase";

export default function DeleteRecordingButton({ id, filePath }: { id: string; filePath: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function deleteRecording() {
    setDeleting(true);
    setErrorMessage("");
    const supabase = createClient();
    // File first: if that fails we stop, and nothing is half-deleted. If the file went
    // but the row didn't, the user can just try again (removing a missing file is fine).
    const { error: fileError } = await supabase.storage.from("recordings").remove([filePath]);
    if (fileError) {
      setErrorMessage("Couldn't delete the audio file. Please try again.");
      setDeleting(false);
      return;
    }
    const { error: rowError } = await supabase.from("recordings").delete().eq("id", id);
    if (rowError) {
      setErrorMessage("Couldn't delete the results. Please try again.");
      setDeleting(false);
      return;
    }
    router.push("/history");
    router.refresh(); // so the History list doesn't show the deleted row from before
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Trash2 /> Delete recording
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!deleting) setOpen(value); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this recording?</DialogTitle>
            <DialogDescription>
              This permanently deletes the audio, transcript and feedback. You can&apos;t undo it.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={deleteRecording} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, delete it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
