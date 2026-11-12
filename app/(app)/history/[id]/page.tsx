// /history/<id>: the full results for one recording (opened by clicking a row on /history).
// [id] in the folder name means "any value here"; Next.js passes it to us as params.id.
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import DeleteRecordingButton from "@/components/results/delete-recording-button";
import ResultsView from "@/components/results/results-view";
import SinceLastTime from "@/components/results/since-last-time";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Recording } from "@/lib/recording-types";

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

  const header = (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-6">
      <div className="min-w-0 space-y-1">
        <h1 className="text-3xl leading-[1.05] font-semibold break-all sm:text-4xl">{recording.original_name}</h1>
        <p className="text-muted-foreground">
          {new Date(recording.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
          {recording.duration_ms !== null && ` · ${Math.round(recording.duration_ms / 1000)} seconds`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* the next step after reading feedback is usually to try again */}
        {recording.status === "done" && (
          <Link href="/upload" className={buttonVariants()}>
            <Upload /> Upload another speech
          </Link>
        )}
        {/* available in every state, so users can always erase their own data */}
        <DeleteRecordingButton id={recording.id} filePath={recording.file_path} />
      </div>
    </div>
  );

  if (recording.status === "done" && recording.metrics && recording.feedback && recording.transcript) {
    // the newest finished recording made before this one (RLS keeps it to this user's own rows)
    const { data: prev } = await supabase.from("recordings").select("metrics")
      .eq("status", "done").lt("created_at", recording.created_at)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    const previous = (prev as Pick<Recording, "metrics"> | null)?.metrics;
    return (
      <>
        {header}
        {previous && <SinceLastTime current={recording.metrics} previous={previous} />}
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
