// /history/<id>: the full results for one recording (opened by clicking a row on /history).
// [id] in the folder name means "any value here"; Next.js passes it to us as params.id.
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2, Repeat, Shuffle, Upload } from "lucide-react";
import DeleteRecordingButton from "@/components/results/delete-recording-button";
import RenameRecordingButton from "@/components/history/rename-recording-button";
import ResultsView from "@/components/results/results-view";
import RedoCompare from "@/components/redo/redo-compare";
import SinceLastTime from "@/components/results/since-last-time";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createServerSupabase } from "@/lib/supabase-server";
import { isStuck, type Recording } from "@/lib/recording-types";
import RetryAnalysisButton from "@/components/results/retry-analysis-button";
import { formatClock, impromptuFromRow } from "@/lib/impromptu/topics";

// Tab title = the recording's file name, or "Page not found" when the row doesn't exist or isn't yours
// (Row Level Security hides other people's). One small extra query; the page below already loads at request time.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("recordings").select("original_name").eq("id", id).maybeSingle();
  return { title: data?.original_name ?? "Page not found" };
}

async function RecordingResults({ params }: { params: Promise<{ id: string }> }) {
  // read the id in here, inside <Suspense>, because it's only known when someone visits
  const { id } = await params;
  await connection();
  const supabase = await createServerSupabase();
  // Row Level Security only returns the row if it belongs to the logged-in user,
  // so someone else's id gives no row (an error) and we show "not found".
  const { data, error } = await supabase.from("recordings").select("*").eq("id", id).single();
  if (error || !data) notFound();
  // The Supabase client doesn't know our table's shape, so we tell TypeScript what came back
  const recording = data as Recording;
  const impromptu = impromptuFromRow(recording);

  const header = (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-6">
      <div className="min-w-0 space-y-1">
        <h1 className="text-3xl leading-[1.05] font-semibold break-all sm:text-4xl">{recording.original_name}</h1>
        <p className="text-muted-foreground">
          {new Date(recording.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
          {recording.duration_ms !== null && ` · ${Math.round(recording.duration_ms / 1000)} seconds`}
          {impromptu && ` · Impromptu, ${formatClock(impromptu.targetSeconds)} target`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* the next step after reading feedback is usually to try again */}
        {/* "Redo this speech": record it again with the same topic / script, then see both takes side by side (components/redo) */}
        {recording.status === "done" && (
          <Link href={`${impromptu ? "/impromptu" : "/record"}?redo=${recording.id}`} className={buttonVariants()}>
            <Repeat /> Redo this speech
          </Link>
        )}
        {recording.status === "done" && (impromptu ? (
          <Link href="/impromptu" className={buttonVariants({ variant: "outline" })}>
            <Shuffle /> Try another topic
          </Link>
        ) : (
          <Link href="/upload" className={buttonVariants({ variant: "outline" })}>
            <Upload /> Upload another speech
          </Link>
        ))}
        {/* available in every state, so users can always erase their own data */}
        <RenameRecordingButton id={recording.id} name={recording.original_name} />
        <DeleteRecordingButton id={recording.id} filePath={recording.file_path} />
      </div>
    </div>
  );

  if (recording.status === "done" && recording.metrics && recording.feedback && recording.transcript) {
    // A redo is compared with the take it redid (components/redo/redo-compare.tsx); anything else with the
    // newest finished recording made before it. RLS keeps both lookups to this user's own rows.
    const redoOf = recording.feedback.redoOf;
    const { data: earlierRow } = redoOf
      ? await supabase.from("recordings").select("id, original_name, metrics, feedback, duration_ms").eq("id", redoOf).eq("status", "done").maybeSingle()
      : { data: null };
    const earlier = earlierRow as Pick<Recording, "id" | "original_name" | "metrics" | "feedback" | "duration_ms"> | null;
    const { data: prev } = earlier ? { data: null } : await supabase.from("recordings").select("metrics")
      .eq("status", "done").lt("created_at", recording.created_at)
      .neq("size_bytes", recording.size_bytes) // not the same audio uploaded twice (every number would read "same")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    const previous = (prev as Pick<Recording, "metrics"> | null)?.metrics;
    return (
      <>
        {header}
        {earlier?.metrics && earlier.feedback ? (
          <RedoCompare earlierId={earlier.id} earlierName={earlier.original_name}
            earlier={{ metrics: earlier.metrics, feedback: earlier.feedback, durationMs: earlier.duration_ms ?? 0 }}
            current={{ metrics: recording.metrics, feedback: recording.feedback, durationMs: recording.duration_ms ?? recording.transcript.durationMs }} />
        ) : (
          previous && <SinceLastTime current={recording.metrics} previous={previous} />
        )}
        <ResultsView metrics={recording.metrics} feedback={recording.feedback} transcript={recording.transcript} impromptu={impromptu} />
      </>
    );
  }

  // Not finished (or failed): explain where it is instead of showing empty results. "Try again" when it can
  // be retried: failed, or stuck on "analyzing" past the time the server could still be working on it.
  const stuck = isStuck(recording);
  return (
    <>
      {header}
      <Card className="items-center py-10 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          {recording.status === "failed" ? (
            <p className="text-destructive">Analysis failed: {recording.error_message ?? "unknown reason"}</p>
          ) : stuck ? (
            <p className="text-destructive">This analysis didn&apos;t finish.</p>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {recording.status === "analyzing" ? "Still analyzing... refresh in a few minutes." : "Waiting to be analyzed."}
            </p>
          )}
          {recording.status === "failed" || stuck ? (
            <RetryAnalysisButton id={recording.id} />
          ) : (
            <Link href="/upload" className={buttonVariants({ variant: "outline" })}>Upload another speech</Link>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Gray placeholders shaped like the results while they load.
function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-2/3" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function RecordingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <Link href="/history" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All recordings
      </Link>
      <Suspense fallback={<ResultsSkeleton />}>
        <RecordingResults params={params} />
      </Suspense>
    </main>
  );
}
