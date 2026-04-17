/**
 * Simple fuzzy match: query characters must appear in order within the text.
 * Case insensitive.
 */
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  let ti = 0;
  let qi = 0;
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) qi++;
    ti++;
  }
  return qi === q.length;
}
