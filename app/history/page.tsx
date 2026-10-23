import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import formatSize from "@/lib/format-size";
import {createServerSupabase} from "@/lib/supabase-server"
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
        return <p>We encountered an error with the display. Please try refreshing.</p>
    }
    if (data.length === 0) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 px-4">
                <p className="text-zinc-900">No recordings yet.</p>
                <Link href="/upload" className="text-blue-600 hover:underline">Upload your first recording</Link>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <h1 className="text-2xl font-semibold text-zinc-900">Your recordings</h1>
            <ul className="mt-6 space-y-3">
                {/* map returns one <li> per row; key lets React tell the items apart */}
                {data.map((row) => (
                    <li key={row.id} className="rounded-xl bg-white p-4 text-zinc-900 shadow">
                        <p className="font-medium">{row.original_name}</p>
                        <p className="text-sm text-zinc-600">
                            {formatSize(row.size_bytes)} · {new Date(row.created_at).toLocaleDateString()}
                        </p>
                        {/* What we show depends on where the recording is in the analysis */}
                        {row.status === "analyzing" && (
                            <p className="mt-2 text-sm text-zinc-600">Analyzing... refresh in a few minutes.</p>
                        )}
                        {row.status === "uploaded" && (
                            <p className="mt-2 text-sm text-zinc-600">Waiting to be analyzed.</p>
                        )}
                        {row.status === "failed" && (
                            <p className="mt-2 text-sm text-red-600">Analysis failed: {row.error_message ?? "unknown reason"}</p>
                        )}
                        {/* metrics and feedback can be null, so check they exist before reading them */}
                        {row.status === "done" && row.metrics && row.feedback && (
                            <div className="mt-2 text-sm">
                                <p className="text-zinc-900">
                                    {row.metrics.wordsPerMinute} words per minute · {row.metrics.fillerCount} filler words · {row.metrics.pauses.length} long pauses
                                </p>
                                <p className="mt-1 text-zinc-600">{row.feedback.summary}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </main>
    );
}


export default function HistoryPage() {
    return (
        <Suspense fallback={<p className="p-10 text-zinc-600">Loading your recordings...</p>}>
            <RecordingsList />
        </Suspense>
    );
}