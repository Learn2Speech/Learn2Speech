"use client"; // needs a click and a long request
// "Try again" on a results page whose analysis failed or got stuck: runs the analysis again on the saved
// recording, so nobody has to re-upload (which made a duplicate). It counts toward the daily limit like any
// analysis. A typed topic or script isn't saved with the recording, so a retry is a plain run.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANALYZING_MESSAGE } from "@/components/practice/use-get-feedback";
import { analyzeRecording } from "@/lib/upload-recording";

export default function RetryAnalysisButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function retry() {
    setBusy(true);
    setErrorMessage("");
    try {
      await analyzeRecording(id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
    router.refresh(); // shows the results, or the new error
  }

  return (
    <>
      <Button onClick={retry} disabled={busy} className="h-12 px-6 text-base">
        {busy ? <><Loader2 className="animate-spin" /> Analyzing...</> : <><RotateCcw /> Try again</>}
      </Button>
      {/* the long wait message sits under the button: buttons don't wrap, and it's too wide for a phone */}
      {busy && <p className="text-sm text-muted-foreground">{ANALYZING_MESSAGE}</p>}
      {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
    </>
  );
}
