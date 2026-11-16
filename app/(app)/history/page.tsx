import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import {createServerSupabase} from "@/lib/supabase-server"
import PageHeader from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressChart from "@/components/history/progress-chart"
import HistoryList, {type HistoryRow} from "@/components/history/history-list"
import { duplicateIds } from "@/lib/duplicates"
import { impromptuFromRow } from "@/lib/impromptu/topics"

export const metadata: Metadata = { title: "History" };

// Only the columns the list shows (HistoryRow). We leave out the full transcript on purpose:
// it holds every word with timestamps, which is too heavy to load for every row.

async function RecordingsList() {

    await connection();
    const supabase = await createServerSupabase();
    const {data: rows, error} = await supabase
        .from("recordings")
        .select("id, original_name, file_path, size_bytes, duration_ms, created_at, status, metrics, feedback, error_message, topic, target_seconds")
        .order("created_at", {ascending: false})
    // The Supabase client doesn't know our table's shape, so we tell TypeScript what came back
    const data = (rows ?? []) as HistoryRow[]
    if (error) {
        return <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">We encountered an error with the display. Please try refreshing.</p>
    }
    if (data.length === 0) {
        return (
            <div className="border-y border-foreground py-14">
                <p className="text-3xl font-semibold">No recordings yet</p>
                <p className="mt-2 text-lg text-muted-foreground">Upload a practice run and it will show up here. Want to see what you get first? <Link href="/demo" className="font-medium text-foreground underline underline-offset-4">Try the tutorial</Link></p>
                <Link href="/upload" className={buttonVariants({ size: "lg", className: "mt-6 h-12 px-6" })}>Upload your first recording</Link>
            </div>
        );
    }
    // finished recordings only, oldest first, so the chart reads left → right over time
    // ([...data] copies first, because reverse() would also flip the list below)
    // duplicates (the same audio uploaded again) stay in the list, marked, but don't count twice in the charts
    const duplicates = duplicateIds(data)
    const finished = [...data].reverse().filter((row) => row.status === "done" && row.metrics && !duplicates.has(row.id))
    const points = finished.map((row) => ({createdAt: row.created_at, metrics: row.metrics!}))
    // the same charts again for impromptu runs only, once there's at least one (it says when it needs more)
    const impromptuPoints = finished.filter((row) => impromptuFromRow(row)).map((row) => ({createdAt: row.created_at, metrics: row.metrics!}))
    const showImpromptu = impromptuPoints.length >= 1
    return (
        <>
        <ProgressChart points={points} />
        {showImpromptu && <ProgressChart points={impromptuPoints} title="Impromptu progress" />}
        <HistoryList rows={data} duplicates={[...duplicates]} />
        </>
    );
}

// Gray placeholder rows shown while the list loads, shaped like the real rows.
function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-md" />)}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12">
            <PageHeader title="Your recordings" description="Every speech you've uploaded, newest first." />
            <Suspense fallback={<ListSkeleton />}>
                <RecordingsList />
            </Suspense>
        </main>
    );
}
