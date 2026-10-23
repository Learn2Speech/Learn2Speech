import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { FileAudio, Mic } from "lucide-react";
import formatSize from "@/lib/format-size";
import {createServerSupabase} from "@/lib/supabase-server"
import PageHeader from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function RecordingsList() {

    await connection();
    const supabase = await createServerSupabase();
    const {data, error} = await supabase.from("recordings").select("*").order("created_at", {ascending: false})
    if (error) {
        return <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">We encountered an error with the display. Please try refreshing.</p>
    }
    if (data.length === 0) {
        return (
            <Card className="items-center py-12 text-center">
                <CardContent className="flex flex-col items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                        <Mic className="size-6" />
                    </span>
                    <p className="font-medium">No recordings yet</p>
                    <p className="text-sm text-muted-foreground">Upload a speech and it will show up here.</p>
                    <Link href="/upload" className={buttonVariants({ className: "mt-2" })}>Upload your first recording</Link>
                </CardContent>
            </Card>
        );
    }
    return (
        <ul className="space-y-3">
            {/* map returns one <li> per row; key lets React tell the items apart */}
            {data.map((row) => (
                <li key={row.id}>
                    <Card size="sm" className="flex-row items-center gap-4 px-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                            <FileAudio className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-medium">{row.original_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatSize(row.size_bytes)} · {new Date(row.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                </li>
            ))}
        </ul>
    );
}

// Gray placeholder rows shown while the list loads, shaped like the real rows.
function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[68px] w-full rounded-xl" />)}
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
