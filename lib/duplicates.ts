// Which recordings are the same audio uploaded again. The first upload is the original; every later
// upload with the exact same file size is a duplicate. Size survives a rename, and two different speeches
// landing on the very same byte count is extremely unlikely for compressed audio.
// shortcut: two different files of identical size would be marked too; compare a file hash if that ever happens.
// History marks duplicates; the progress charts leave them out so one speech doesn't count twice.
export function duplicateIds(rows: { id: string; size_bytes: number; created_at: string }[]): Set<string> {
  const oldestFirst = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const seen = new Set<number>();
  const duplicates = new Set<string>();
  for (const row of oldestFirst) {
    if (seen.has(row.size_bytes)) duplicates.add(row.id);
    else seen.add(row.size_bytes);
  }
  return duplicates;
}
