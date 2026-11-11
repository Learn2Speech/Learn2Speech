import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import formatSize from "@/lib/format-size";
import {createServerSupabase} from "@/lib/supabase-server"
import PageHeader from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type {Recording} from "@/lib/recording-types"

// Only the columns the list shows. We leave out the full transcript on purpose:
// it holds every word with timestamps, which is too heavy to load for every row.
type HistoryRow = Pick<Recording, "id" | "original_name" | "size_bytes" | "created_at" | "status" | "metrics" | "feedback" | "error_message">

async function RecordingsList() {

    await connection();
    const supabase = await createServerSupabase();
    const {data: rows, error} = await supabase
        .from("recordings")
        .select("id, original_name, size_bytes, created_at, status, metrics, feedback, error_message")
        .order("created_at", {ascending: false})
    // The Supabase client doesn't know our table's shape, so we tell TypeScript what came back
    const data = (rows ?? []) as HistoryRow[]
    if (error) {
        return <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">We encountered an error with the display. Please try refreshing.</p>
    }
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-14 text-center">
                <p className="font-heading text-lg font-medium">No recordings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload a speech and it will show up here.</p>
                <Link href="/upload" className={buttonVariants({ className: "mt-5" })}>Upload your first recording</Link>
            </div>
        );
    }
    return (
        <ul className="divide-y border-y">
            {/* map returns one <li> per row; key lets React tell the items apart */}
            {data.map((row) => (
                <li key={row.id}>
                    {/* the whole row is a link to that recording's full results */}
                    <Link href={`/history/${row.id}`} className="block py-5 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:-mx-3 sm:rounded-md sm:px-3">
                        <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 truncate font-medium" title={row.original_name}>{row.original_name}</p>
                            <StatusBadge status={row.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {formatSize(row.size_bytes)} · {new Date(row.created_at).toLocaleDateString()}
                        </p>
                        {/* What we show depends on where the recording is in the analysis */}
                        {row.status === "analyzing" && (
                            <p className="mt-2 text-sm text-muted-foreground">Analyzing... refresh in a few minutes.</p>
                        )}
                        {row.status === "uploaded" && (
                            <p className="mt-2 text-sm text-muted-foreground">Waiting to be analyzed.</p>
                        )}
                        {row.status === "failed" && (
                            <p className="mt-2 text-sm text-destructive">Analysis failed: {row.error_message ?? "unknown reason"}</p>
                        )}
                        {/* metrics and feedback can be null, so check they exist before reading them */}
                        {row.status === "done" && row.metrics && row.feedback && (
                            <div className="mt-3 space-y-2 text-sm">
                                <p className="flex flex-wrap gap-x-5 gap-y-1 tabular-nums">
                                    <span><span className="font-medium">{row.metrics.wordsPerMinute}</span> <span className="text-muted-foreground">words/min</span></span>
                                    <span><span className="font-medium">{row.metrics.fillerCount}</span> <span className="text-muted-foreground">fillers</span></span>
                                    <span><span className="font-medium">{row.metrics.pauses.length}</span> <span className="text-muted-foreground">long pauses</span></span>
                                </p>
                                <p className="line-clamp-2 text-muted-foreground">{row.feedback.summary}</p>
                            </div>
                        )}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// Small colored label in the corner of each row, so you can scan the list for what's finished.
function StatusBadge({ status }: { status: Recording["status"] }) {
    const labels: Record<Recording["status"], string> = { uploaded: "Waiting", analyzing: "Analyzing", done: "Done", failed: "Failed" };
    const colors: Record<Recording["status"], string> = {
        uploaded: "",
        analyzing: "border-brand/30 bg-accent text-accent-foreground",
        done: "border-green-600/30 bg-green-600/10 text-green-700",
        failed: "border-destructive/30 bg-destructive/10 text-destructive",
    };
    return <Badge variant="outline" className={`shrink-0 ${colors[status]}`}>{labels[status]}</Badge>;
}

// Gray placeholder rows shown while the list loads, shaped like the real rows.
function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[68px] w-full rounded-md" />)}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <main className="mx-auto w-full max-w-2xl px-6 py-10">
            <PageHeader title="Your recordings" description="Every speech you've uploaded, newest first." />
            <Suspense fallback={<ListSkeleton />}>
                <RecordingsList />
            </Suspense>
        </main>
    );
}
