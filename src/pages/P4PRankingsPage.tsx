import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getP4PFighters } from '@/lib/fighters';
import type { Fighter } from '@/lib/types';
import RankingRow from '@/components/RankingRow';

export default function P4PRankingsPage() {
  const [searchParams] = useSearchParams();
  const gender = (searchParams.get('gender') as 'male' | 'female') || 'male';

  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getP4PFighters(gender)
      .then(setFighters)
      .catch(() => setError('Failed to load P4P rankings.'))
      .finally(() => setLoading(false));
  }, [gender]);

  return (
    <div className="rankings-page">
      <div className="container">
        <div className="rankings-header">
          <div className="rankings-gender-tabs">
            <Link
              to="/rankings/p4p?gender=male"
              className={`gender-tab ${gender === 'male' ? 'active' : ''}`}
            >
              Male
            </Link>
            <Link
              to="/rankings/p4p?gender=female"
              className={`gender-tab ${gender === 'female' ? 'active' : ''}`}
            >
              Female
            </Link>
          </div>
          <div className="rankings-division-title">
            <h1>Pound for Pound</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.9rem' }}>
            The best {gender} fighters in Australia, regardless of weight class.
          </p>
        </div>

        <div className="ranking-list">
          {loading && <div className="empty-state">Loading rankings...</div>}
          {error && <div className="empty-state">{error}</div>}
          {!loading && !error && (
            <>
              {fighters.map(fighter => (
                <RankingRow key={fighter.id} fighter={fighter} showDivision />
              ))}
              {fighters.length === 0 && (
                <div className="empty-state">P4P rankings coming soon.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
