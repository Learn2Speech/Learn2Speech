"use client"; // needs clicks, state and the browser's Supabase login
// Rename a recording (History rows and the results page). Only the name can change: migration 0011 lets
// a user update original_name on their own rows and nothing else, so scores and feedback stay untouchable.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { AuthMessage } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DIALOG_CLASS } from "@/components/topic/topic-dialog";
import { createClient } from "@/lib/supabase";

const MAX_NAME = 200; // the database allows 200 (recordings_original_name_len)

export default function RenameRecordingButton({ id, name, compact }: { id: string; name: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const cleaned = draft.trim().replace(/\s+/g, " ");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!cleaned || cleaned === name) return setOpen(false);
    setSaving(true);
    setErrorMessage("");
    const { error } = await createClient().from("recordings").update({ original_name: cleaned }).eq("id", id);
    setSaving(false);
    if (error) return setErrorMessage("Couldn't rename it. Please try again.");
    setOpen(false);
    router.refresh(); // show the new name everywhere on the page
  }

  return (
    <>
      {compact ? (
        <Button variant="ghost" size="icon" onClick={() => { setDraft(name); setOpen(true); }}
          aria-label={`Rename ${name}`} title="Rename" className="size-10">
          <Pencil />
        </Button>
      ) : (
        <Button variant="outline" onClick={() => { setDraft(name); setOpen(true); }}>
          <Pencil /> Rename
        </Button>
      )}
      <Dialog open={open} onOpenChange={(value) => { if (!saving) setOpen(value); }}>
        <DialogContent showCloseButton={false} className={DIALOG_CLASS}>
          <form onSubmit={save} className="grid gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Rename recording</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={`rename-${id}`}>Name</Label>
              <Input id={`rename-${id}`} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_NAME}
                autoComplete="off" autoFocus className="h-12 px-3 text-base md:text-base" />
            </div>
            {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving} className="h-12 border-foreground/30! px-6 text-base">Cancel</Button>
              <Button type="submit" disabled={saving || !cleaned} className="h-12 px-6 text-base">{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
