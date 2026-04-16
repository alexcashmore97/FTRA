import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDivisionById, getDivisionsByGender } from '@/lib/divisions';
import { getFightersByDivision } from '@/lib/fighters';
import type { Fighter } from '@/lib/types';
import RankingRow from '@/components/RankingRow';
import SEO from '@/components/SEO';

export default function DivisionRankingsPage() {
  const { divisionId } = useParams<{ divisionId: string }>();
  const division = getDivisionById(divisionId ?? '');

  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!division) return;
    setLoading(true);
    setError(null);
    getFightersByDivision(division.id)
      .then(setFighters)
      .catch((err) => {
        console.error('Rankings fetch error:', err);
        setError('Failed to load rankings.');
      })
      .finally(() => setLoading(false));
  }, [division?.id]);

  if (!division) {
    return (
      <div className="rankings-page">
        <div className="container">
          <h1>Division not found</h1>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '24px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const genderDivisions = getDivisionsByGender(division.gender);
  const divId = division.id;
  const oppositeId = division.gender === 'male'
    ? division.id.replace('male-', 'female-')
    : division.id.replace('female-', 'male-');
  const oppositeExists = !!getDivisionById(oppositeId);
  const champions = fighters.filter(f => f.rankings[divId]?.titleHolder);
  const ranked = fighters
    .filter(f => !f.rankings[divId]?.titleHolder && f.rankings[divId]?.rank !== null)
    .sort((a, b) => (a.rankings[divId]?.rank ?? 99) - (b.rankings[divId]?.rank ?? 99));
const rankingClassname = `rankings-banner-img-${division.name}`.split(' ').join('')
  return (
    <div className="rankings-page">
      <SEO
        title={`${division.name} ${division.weight} Rankings | Australian Muay Thai | FTRA`}
        description={`Official ${division.gender === 'male' ? 'Male' : 'Female'} ${division.name} ${division.weight} Australian Muay Thai rankings. View current champions and ranked fighters.`}
        path={`/rankings/${division.id}`}
      />
      {/* Division hero banner */}
      <div className="rankings-banner">
        <img src={division.image} alt={`${division.gender === 'male' ? 'Male' : 'Female'} ${division.name} ${division.weight} division`} loading="lazy" className={`rankings-banner-img ${rankingClassname}`} />
        <div className="rankings-banner-overlay" />
      </div>

      <div className="container">
        <div className="rankings-header">
          <div className="rankings-gender-tabs">
            {(division.gender === 'male' || oppositeExists) && (
              <Link
                to={`/rankings/${division.gender === 'male' ? division.id : oppositeId}`}
                className={`gender-tab ${division.gender === 'male' ? 'active' : ''}`}
              >
                Male
              </Link>
            )}
            {(division.gender === 'female' || oppositeExists) && (
              <Link
                to={`/rankings/${division.gender === 'female' ? division.id : oppositeId}`}
                className={`gender-tab ${division.gender === 'female' ? 'active' : ''}`}
              >
                Female
              </Link>
            )}
          </div>
          <div className="rankings-division-title">
            <h1>{division.name}</h1>
            <span className="weight">{division.weight}</span>
          </div>
        </div>

        {/* Quick-nav pills */}
        <div className="division-pills">
          {genderDivisions.map(d => (
            <Link
              key={d.id}
              to={`/rankings/${d.id}`}
              className={`division-pill ${d.id === division.id ? 'active' : ''}`}
            >
              {d.name}
            </Link>
          ))}
        </div>

        {/* Rankings */}
        <div className="ranking-list">
          {loading && <div className="empty-state">Loading rankings...</div>}
          {error && <div className="empty-state">{error}</div>}
          {!loading && !error && (
            <>
              {champions.map(fighter => (
                <RankingRow key={fighter.id} fighter={fighter} divisionId={divId} />
              ))}
              {ranked.map(fighter => (
                <RankingRow key={fighter.id} fighter={fighter} divisionId={divId} />
              ))}
              {fighters.length === 0 && (
                <div className="empty-state">
                  No ranked fighters in this division yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
