"use client"; // filters the list as you type
// The list on /history, with a search box (name or topic) and a from/to date filter, plus Rename and a red
// Delete on every row so people don't have to open a recording to tidy up. Filtering and paging happen in the
// browser: the page already loaded every row (newest first), so there's nothing to fetch. 6 per page.
// Duplicates (the same audio uploaded again, lib/duplicates.ts) get an orange "Duplicate" tag.
import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import formatSize from "@/lib/format-size";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeleteRecordingButton from "@/components/results/delete-recording-button";
import RenameRecordingButton from "@/components/history/rename-recording-button";
import { impromptuFromRow } from "@/lib/impromptu/topics";
import type { Recording } from "@/lib/recording-types";

export type HistoryRow = Pick<Recording, "id" | "original_name" | "file_path" | "size_bytes" | "duration_ms" | "created_at" | "status" | "metrics" | "feedback" | "error_message" | "topic" | "target_seconds">;

// a date input gives "2026-11-15"; compare it with the recording's day in the viewer's own time zone
const localDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const topicOf = (row: HistoryRow) => impromptuFromRow(row)?.topic ?? row.feedback?.topic?.topic ?? "";

const PER_PAGE = 6;

export default function HistoryList({ rows, duplicates }: { rows: HistoryRow[]; duplicates: string[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pickedPage, setPage] = useState(1);
  const [hideDuplicates, setHideDuplicates] = useState(false); // only hides them here; nothing is deleted
  const listRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();
  const shown = rows.filter((row) => {
    if (hideDuplicates && duplicates.includes(row.id)) return false;
    const day = localDay(row.created_at);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return !q || `${row.original_name} ${topicOf(row)}`.toLowerCase().includes(q);
  });
  const filtering = Boolean(q || from || to);
  const pageCount = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const page = Math.min(pickedPage, pageCount); // a delete can empty the last page
  const onPage = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  // changing a filter starts again at page 1
  const filter = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { set(e.target.value); setPage(1); };
  function goTo(n: number) {
    setPage(n);
    listRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <div ref={listRef} className="scroll-mt-20">
        <div role="search" className="mb-6 flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="grid min-w-56 flex-1 gap-1.5">
            <Label htmlFor="history-search">Search</Label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="history-search" type="search" value={query} onChange={filter(setQuery)}
                placeholder="Name or topic" className="h-11 pl-9 text-base md:text-base" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-from">From</Label>
            <Input id="history-from" type="date" value={from} max={to || undefined} onChange={filter(setFrom)} className="h-11 w-auto text-base md:text-base" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-to">To</Label>
            <Input id="history-to" type="date" value={to} min={from || undefined} onChange={filter(setTo)} className="h-11 w-auto text-base md:text-base" />
          </div>
          {/* a switch (same look as the live filler counter's), only when there are duplicates to hide */}
          {duplicates.length > 0 && (
            <button type="button" role="switch" aria-checked={hideDuplicates} onClick={() => { setHideDuplicates(!hideDuplicates); setPage(1); }}
              className="flex h-11 cursor-pointer items-center gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <span aria-hidden="true" className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150",
                hideDuplicates ? "border-transparent bg-primary" : "border-foreground/30 bg-secondary")}>
                <span className={cn("absolute left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                  hideDuplicates ? "translate-x-5" : "translate-x-0")} />
              </span>
              Hide duplicates
            </button>
          )}
          {filtering && (
            <Button variant="ghost" onClick={() => { setQuery(""); setFrom(""); setTo(""); setPage(1); }} className="h-11">
              <X /> Clear
            </Button>
          )}
          {/* says how many match, and screen readers hear it as the list narrows */}
          <p aria-live="polite" className="w-full text-sm text-muted-foreground tabular-nums">
            {filtering || hideDuplicates ? `Showing ${shown.length} of ${rows.length} recordings` : ""}
          </p>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="border-y border-foreground py-10 text-lg text-muted-foreground">No recordings match. Try a different word or dates.</p>
      ) : (
        <ul className="divide-y border-y border-foreground">
          {onPage.map((row) => {
            const impromptu = impromptuFromRow(row);
            return (
              <li key={row.id} className="relative">
                {/* the row is a link to the full results; the buttons sit on top of it at the right, outside the link */}
                <Link href={`/history/${row.id}`} className="block py-6 pr-24 transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:-mx-3 sm:rounded-md sm:px-3 sm:pr-28">
                  <p className="truncate text-xl font-semibold sm:text-2xl" title={row.original_name}>{row.original_name}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {/* solid orange so it can't be missed: this one isn't counted in the charts */}
                    {duplicates.includes(row.id) && <Badge className="border-transparent bg-primary text-primary-foreground">Duplicate</Badge>}
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

      {pageCount > 1 && (
        <nav aria-label="History pages" className="mt-6 flex flex-wrap items-center justify-center gap-1">
          <Button variant="ghost" onClick={() => goTo(page - 1)} disabled={page === 1} className="h-11">
            <ChevronLeft /> Previous
          </Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Button key={n} variant="ghost" onClick={() => goTo(n)} aria-label={`Page ${n}`} aria-current={n === page ? "page" : undefined}
              className={cn("size-11 tabular-nums", n === page && "bg-secondary font-semibold")}>
              {n}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => goTo(page + 1)} disabled={page === pageCount} className="h-11">
            Next <ChevronRight />
          </Button>
        </nav>
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
