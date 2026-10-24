// /history/<id>: the full results for one recording (opened by clicking a row on /history).
// [id] in the folder name means "any value here"; Next.js passes it to us as params.id.
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import ResultsView from "@/components/results/results-view";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Recording } from "@/lib/recording-types";

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

  const header = (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight break-all">{recording.original_name}</h1>
        <p className="text-muted-foreground">
          {new Date(recording.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
          {recording.duration_ms !== null && ` · ${Math.round(recording.duration_ms / 1000)} seconds`}
        </p>
      </div>
      {/* the next step after reading feedback is usually to try again */}
      {recording.status === "done" && (
        <Link href="/upload" className={buttonVariants()}>
          <Upload /> Upload another speech
        </Link>
      )}
    </div>
  );

  if (recording.status === "done" && recording.metrics && recording.feedback && recording.transcript) {
    return (
      <>
        {header}
        <ResultsView metrics={recording.metrics} feedback={recording.feedback} transcript={recording.transcript} />
      </>
    );
  }

  // Not finished (or failed): explain where it is instead of showing empty results.
  return (
    <>
      {header}
      <Card className="items-center py-10 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          {recording.status === "failed" ? (
            <p className="text-destructive">Analysis failed: {recording.error_message ?? "unknown reason"}</p>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {recording.status === "analyzing" ? "Still analyzing... refresh in a few minutes." : "Waiting to be analyzed."}
            </p>
          )}
          <Link href="/upload" className={buttonVariants({ variant: "outline" })}>Upload another speech</Link>
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
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link href="/history" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All recordings
      </Link>
      <Suspense fallback={<ResultsSkeleton />}>
        <RecordingResults params={params} />
      </Suspense>
    </main>
  );
}
