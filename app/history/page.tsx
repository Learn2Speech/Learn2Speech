import Link from "next/link";
import formatSize from "@/lib/format-size";
import {createServerSupabase} from "@/lib/supabase-server"
export default async function HistoryPage() {
    const supabase = await createServerSupabase();
    const {data, error} = await supabase.from("recordings").select("*").order("created_at", {ascending: false})
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
                    </li>
                ))}
            </ul>
        </main>
    );
}