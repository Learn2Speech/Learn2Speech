"use client"; // filters the list as you type
// The list on /history, with a search box (name or topic) and a from/to date filter, plus Rename and a red
// Delete on every row so people don't have to open a recording to tidy up. Filtering happens in the browser:
// the page already loaded every row (newest first), so there's nothing to fetch.
import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import formatSize from "@/lib/format-size";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeleteRecordingButton from "@/components/results/delete-recording-button";
import RenameRecordingButton from "@/components/history/rename-recording-button";
import { impromptuFromRow } from "@/lib/impromptu/topics";
import type { Recording } from "@/lib/recording-types";

export type HistoryRow = Pick<Recording, "id" | "original_name" | "file_path" | "size_bytes" | "created_at" | "status" | "metrics" | "feedback" | "error_message" | "topic" | "target_seconds">;

// a date input gives "2026-11-15"; compare it with the recording's day in the viewer's own time zone
const localDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const topicOf = (row: HistoryRow) => impromptuFromRow(row)?.topic ?? row.feedback?.topic?.topic ?? "";

export default function HistoryList({ rows }: { rows: HistoryRow[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const q = query.trim().toLowerCase();
  const shown = rows.filter((row) => {
    const day = localDay(row.created_at);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return !q || `${row.original_name} ${topicOf(row)}`.toLowerCase().includes(q);
  });
  const filtering = Boolean(q || from || to);

  return (
    <>
      {/* only worth showing once there's something to look through */}
      {rows.length > 1 && (
        <div role="search" className="mb-6 flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="grid min-w-56 flex-1 gap-1.5">
            <Label htmlFor="history-search">Search</Label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="history-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or topic" className="h-11 pl-9 text-base md:text-base" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-from">From</Label>
            <Input id="history-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-11 w-auto text-base md:text-base" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-to">To</Label>
            <Input id="history-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-11 w-auto text-base md:text-base" />
          </div>
          {filtering && (
            <Button variant="ghost" onClick={() => { setQuery(""); setFrom(""); setTo(""); }} className="h-11">
              <X /> Clear
            </Button>
          )}
          {/* says how many match, and screen readers hear it as the list narrows */}
          <p aria-live="polite" className="w-full text-sm text-muted-foreground tabular-nums">
            {filtering ? `Showing ${shown.length} of ${rows.length} recordings` : ""}
          </p>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="border-y border-foreground py-10 text-lg text-muted-foreground">No recordings match. Try a different word or dates.</p>
      ) : (
        <ul className="divide-y border-y border-foreground">
          {shown.map((row) => {
            const impromptu = impromptuFromRow(row);
            return (
              <li key={row.id} className="relative">
                {/* the row is a link to the full results; the buttons sit on top of it at the right, outside the link */}
                <Link href={`/history/${row.id}`} className="block py-6 pr-24 transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:-mx-3 sm:rounded-md sm:px-3 sm:pr-28">
                  <p className="truncate text-xl font-semibold sm:text-2xl" title={row.original_name}>{row.original_name}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {impromptu && <Badge variant="outline" className="border-orange/40 bg-orange/10 text-foreground">Impromptu</Badge>}
                    {/* a redo of an earlier take (components/redo) */}
                    {row.feedback?.redoOf && <Badge variant="outline">Redo</Badge>}
                    {/* practiced from a pasted script (components/script) */}
                    {row.feedback?.script && <Badge variant="outline">Script</Badge>}
                    <StatusBadge status={row.status} />
                  </div>
                  {impromptu && <p className="mt-2 text-foreground">Topic: {impromptu.topic}</p>}
                  {/* a topic the speaker typed lives in the feedback (topic mode) */}
                  {!impromptu && row.feedback?.topic && <p className="mt-2 break-words text-foreground">Topic: {row.feedback.topic.topic}</p>}
                  <p className="text-sm text-muted-foreground">
                    {formatSize(row.size_bytes)} · {new Date(row.created_at).toLocaleDateString()}
                  </p>
                  {/* What we show depends on where the recording is in the analysis */}
                  {row.status === "analyzing" && <p className="mt-2 text-sm text-muted-foreground">Analyzing... refresh in a few minutes.</p>}
                  {row.status === "uploaded" && <p className="mt-2 text-sm text-muted-foreground">Waiting to be analyzed.</p>}
                  {row.status === "failed" && <p className="mt-2 text-sm text-destructive">Analysis failed: {row.error_message ?? "unknown reason"}</p>}
                  {/* metrics and feedback can be null, so check they exist before reading them */}
                  {row.status === "done" && row.metrics && row.feedback && (
                    <div className="mt-4 space-y-3">
                      <p className="flex flex-wrap items-baseline gap-x-8 gap-y-1 tabular-nums">
                        <span><span className="text-3xl font-black text-(--brand)">{row.metrics.wordsPerMinute}</span> <span className="text-muted-foreground">words/min</span></span>
                        <span><span className="text-3xl font-black text-(--brand)">{row.metrics.fillerCount}</span> <span className="text-muted-foreground">fillers</span></span>
                        <span><span className="text-3xl font-black text-(--brand)">{row.metrics.pauses.length}</span> <span className="text-muted-foreground">long pauses</span></span>
                      </p>
                      <p className="line-clamp-2 max-w-[75ch] text-muted-foreground">{row.feedback.summary}</p>
                    </div>
                  )}
                </Link>
                <div className="absolute top-5 right-0 flex gap-1">
                  <RenameRecordingButton id={row.id} name={row.original_name} compact />
                  <DeleteRecordingButton id={row.id} filePath={row.file_path} name={row.original_name} compact />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// Small colored label on each row, so you can scan the list for what's finished.
function StatusBadge({ status }: { status: Recording["status"] }) {
  const labels: Record<Recording["status"], string> = { uploaded: "Waiting", analyzing: "Analyzing", done: "Done", failed: "Failed" };
  const colors: Record<Recording["status"], string> = {
    uploaded: "",
    analyzing: "border-brand/30 bg-accent text-accent-foreground",
    done: "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400",
    failed: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  return <Badge variant="outline" className={`shrink-0 ${colors[status]}`}>{labels[status]}</Badge>;
}
