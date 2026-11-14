"use client"; // uses the clipboard and shows "Copied" for a moment
// Copies the plain transcript text, for pasting into notes or sending to a teacher.
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CopyTranscriptButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      // clipboard blocked (old browser or no permission): say so; the text can still be selected by hand
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }
  return (
    <Button variant="outline" onClick={copy} className="print:hidden">
      {state === "copied" ? <Check /> : <Copy />}
      {/* aria-live: screen readers hear the result when it changes */}
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Couldn't copy, select the text instead" : "Copy transcript"}
      </span>
    </Button>
  );
}
