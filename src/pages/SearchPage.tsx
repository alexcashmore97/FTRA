import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllFighters } from '@/lib/fighters';
import { DIVISIONS } from '@/lib/divisions';
import { bestFuzzyScore } from '@/lib/fuzzy';
import type { Fighter } from '@/lib/types';
import SEO from '@/components/SEO';

const ORDERED_DIVISIONS = [...DIVISIONS].sort((a, b) => {
  if (a.gender !== b.gender) return a.gender === 'male' ? -1 : 1;
  return a.sortOrder - b.sortOrder;
});

function rankBracket(fighter: Fighter, divisionId: string): string {
  const r = fighter.rankings[divisionId];
  if (!r) return '';
  const parts: string[] = [];
  if (r.rank !== null && r.rank !== undefined) parts.push(`#${r.rank}`);
  if (r.titleHolder) parts.push(r.titleHolder);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllFighters()
      .then(setFighters)
      .catch(err => {
        console.error('Search fetch error:', err);
        setError('Failed to load fighters.');
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const buckets = new Map<string, Fighter[]>();
    for (const f of fighters) {
      const score = bestFuzzyScore(trimmed, [
        `${f.firstName} ${f.lastName}`,
        f.nickname,
        f.gym,
      ]);
      if (score === null) continue;
      for (const dId of f.divisions) {
        const arr = buckets.get(dId) ?? [];
        arr.push(f);
        buckets.set(dId, arr);
      }
    }
    return buckets;
  }, [query, fighters]);

  const totalResults = grouped
    ? Array.from(grouped.values()).reduce((n, arr) => n + arr.length, 0)
    : 0;

  return (
    <div className="rankings-page">
      <SEO
        title="Fighter Search | Australian Muay Thai | FTRA"
        description="Search Australian Muay Thai fighters across every division. Find ranked fighters, champions, and registered competitors by name or gym."
        path="/search"
      />

      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginTop: 48 }}>
          <span className="label">Fighter Search</span>
          <h1>Find a Fighter</h1>
          <p className="auth-subtitle">Search across every division by name, nickname, or gym.</p>
        </div>

        <div className="search-input-wrap">
          <input
            className="input search-input"
            type="search"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search fighters..."
          />
        </div>

        {loading && <div className="empty-state">Loading fighters...</div>}
        {error && <div className="empty-state">{error}</div>}

        {!loading && !error && !query.trim() && (
          <div className="empty-state">Type to search across every division.</div>
        )}

        {!loading && !error && grouped && totalResults === 0 && (
          <div className="empty-state">No fighters match "{query.trim()}".</div>
        )}

        {!loading && !error && grouped && totalResults > 0 && (
          <div className="search-results">
            {ORDERED_DIVISIONS.map(div => {
              const matches = grouped.get(div.id);
              if (!matches || matches.length === 0) return null;
              return (
                <section key={div.id} className="search-division-group">
                  <div className="search-division-heading">
                    <h3>{div.name}</h3>
                    <span className="weight">{div.weight}</span>
                    <span className="search-division-gender">
                      {div.gender === 'male' ? 'Male' : 'Female'}
                    </span>
                  </div>
                  <div className="ranking-list">
                    {matches.map(fighter => {
                      const initials = `${fighter.firstName?.[0] ?? ''}${fighter.lastName?.[0] ?? ''}`;
                      return (
                        <Link
                          key={`${div.id}-${fighter.id}`}
                          to={`/fighters/${fighter.id}`}
                          className="search-row"
                        >
                          <div className="ranking-fighter-photo">
                            {fighter.photoURL
                              ? <img src={fighter.photoURL} alt={`${fighter.firstName} ${fighter.lastName}`} loading="lazy" />
                              : initials
                            }
                          </div>
                          <div className="search-row-info">
                            <div className="search-row-name">
                              {fighter.firstName} {fighter.lastName}
                              <span className="search-row-rank">{rankBracket(fighter, div.id)}</span>
                            </div>
                            <div className="search-row-meta">
                              {fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
