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

            {fighter.instagram && (
              <a
                href={`https://instagram.com/${fighter.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/+$/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fighter-instagram-link"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                @{fighter.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/+$/, '')}
              </a>
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

        {!fighter.uid && (
          <div className="fighter-claim">
            <p>Is this you? Claim this profile to manage your info, upload a photo, and more.</p>
            <Link to={`/register?claim=${fighter.id}`} className="btn btn-primary">
              Claim This Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
