// Returns a positive score for a match, or null for no match.
// Higher score = better match. Substring beats subsequence; earlier and more
// adjacent matches score higher.
export function fuzzyScore(query: string, target: string): number | null {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return null;

  const idx = t.indexOf(q);
  if (idx !== -1) {
    return 1000 - idx + (idx === 0 ? 100 : 0);
  }

  let qi = 0;
  let score = 0;
  let lastMatchIdx = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += ti === lastMatchIdx + 1 ? 5 : 1;
      if (ti === 0 || /\s/.test(t[ti - 1])) score += 3;
      lastMatchIdx = ti;
      qi++;
    }
  }
  return qi === q.length ? score : null;
}

export function bestFuzzyScore(query: string, fields: string[]): number | null {
  let best: number | null = null;
  for (const f of fields) {
    const s = fuzzyScore(query, f);
    if (s !== null && (best === null || s > best)) best = s;
  }
  return best;
}
