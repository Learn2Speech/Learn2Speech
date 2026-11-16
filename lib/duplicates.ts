// Which recordings are the same audio uploaded again. The first upload is the original; a later upload is a
// duplicate when its file size matches AND its length matches (or one of them isn't analyzed yet, so its
// length is unknown). Not the name: Rename changes it, Record names every take by its time, and two different
// speeches can share a name like "speech.m4a". Size and length together are near-certain for compressed audio.
// History marks duplicates; the progress charts leave them out so one speech doesn't count twice.
type Row = { id: string; size_bytes: number; duration_ms: number | null; created_at: string };

const sameAudio = (a: Row, b: Row) =>
  a.size_bytes === b.size_bytes && (a.duration_ms === null || b.duration_ms === null || a.duration_ms === b.duration_ms);

export function duplicateIds(rows: Row[]): Set<string> {
  const oldestFirst = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const originals: Row[] = [];
  const duplicates = new Set<string>();
  for (const row of oldestFirst) {
    if (originals.some((original) => sameAudio(original, row))) duplicates.add(row.id);
    else originals.push(row);
  }
  return duplicates;
}
