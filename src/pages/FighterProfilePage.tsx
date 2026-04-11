import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFighterById } from '@/lib/fighters';
import { getDivisionById } from '@/lib/divisions';
import type { Fighter } from '@/lib/types';

export default function FighterProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getFighterById(id)
      .then(setFighter)
      .catch(() => setError('Failed to load fighter profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="fighter-profile">
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="empty-state">Loading fighter...</div>
        </div>
      </div>
    );
  }

  if (error || !fighter) {
    return (
      <div className="fighter-profile">
        <div className="container" style={{ paddingTop: '120px' }}>
          <h1>{error ?? 'Fighter not found'}</h1>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '24px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const division = getDivisionById(fighter.division);
  const initials = `${fighter.firstName?.[0] ?? ''}${fighter.lastName?.[0] ?? ''}`;

  return (
    <div className="fighter-profile">
      <div className="container">
        <div className="fighter-hero">
          <div className="fighter-photo-wrapper">
            {fighter.photoURL
              ? <img src={fighter.photoURL} alt={`${fighter.firstName} ${fighter.lastName}`} />
              : <div className="fighter-photo-placeholder">{initials}</div>
            }
          </div>

          <div className="fighter-details">
            <div className="fighter-rank-line">
              {fighter.titleHolder && <span className="ranking-title-badge">Champion</span>}
              {division && (
                <Link to={`/rankings/${division.id}`} className="fighter-division-link">
                  {division.name} — {division.weight}
                </Link>
              )}
            </div>

            <h1 className="fighter-name">
              {fighter.firstName}<br />{fighter.lastName}
            </h1>

            {fighter.nickname && (
              <div className="fighter-nickname">&ldquo;{fighter.nickname}&rdquo;</div>
            )}

            <div className="fighter-stats-grid">
              {fighter.record && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">{fighter.record}</div>
                  <div className="fighter-stat-label">Record</div>
                </div>
              )}
              {fighter.age && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">{fighter.age}</div>
                  <div className="fighter-stat-label">Age</div>
                </div>
              )}
              {fighter.stance && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">{fighter.stance}</div>
                  <div className="fighter-stat-label">Stance</div>
                </div>
              )}
              {fighter.gym && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">{fighter.gym}</div>
                  <div className="fighter-stat-label">Gym</div>
                </div>
              )}
              {fighter.state && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">{fighter.state}</div>
                  <div className="fighter-stat-label">State</div>
                </div>
              )}
              {fighter.p4pRank && (
                <div className="fighter-stat">
                  <div className="fighter-stat-value">#{fighter.p4pRank}</div>
                  <div className="fighter-stat-label">P4P Rank</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {fighter.bio && (
          <div className="fighter-bio">
            <h2>About</h2>
            <p>{fighter.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
