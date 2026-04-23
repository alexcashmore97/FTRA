import { Link } from 'react-router-dom';
import { getDivisionById } from '@/lib/divisions';
import type { Fighter } from '@/lib/types';

interface Props {
  fighter: Fighter;
  divisionId?: string;
  showDivision?: boolean;
}

function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/+$/, '');
  return `https://instagram.com/${clean}`;
}

function instagramHandle(raw: string): string {
  const clean = raw.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/+$/, '');
  return `@${clean}`;
}

function titleTier(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('world')) return 'world';
  if (t.includes('australian') || t.includes('national')) return 'national';
  if (t.includes('state')) return 'state';
  return 'other';
}

export default function RankingRow({ fighter, divisionId, showDivision = false }: Props) {
  // When divisionId is provided, show division-specific ranking; otherwise show p4pRank
  const ranking = divisionId ? fighter.rankings[divisionId] : null;
  const rank = divisionId ? (ranking?.rank ?? null) : (fighter.p4pRank ?? null);
  const title = ranking?.titleHolder ?? '';
  const titleDate = ranking?.titleDate ?? null;

  const isChampion = !!title;
  const isTopFive = (rank ?? 99) <= 5;
  const initials = `${fighter.firstName?.[0] ?? ''}${fighter.lastName?.[0] ?? ''}`;

  return (
    <Link to={`/fighters/${fighter.id}`} className={`ranking-row ${isChampion ? 'champion' : ''}`}>
      <div className={`rank-badge ${isChampion ? 'champion' : isTopFive ? 'top-five' : ''}`}>
        {isChampion ? ({ world: 'WC', national: 'NC', state: 'SC' }[titleTier(title)] ?? 'C') : rank ?? '—'}
      </div>

      <div className="ranking-fighter-info">
        <div className="ranking-fighter-photo">
          {fighter.photoURL
            ? <img src={fighter.photoURL} alt={`${fighter.firstName} ${fighter.lastName}, ranked Muay Thai fighter`} loading="lazy" />
            : initials
          }
        </div>
        <div>
          <div className="ranking-fighter-name">
            {fighter.firstName} {fighter.lastName}
            {isChampion && (
              <span className={`ranking-title-inline ${titleTier(title)}`}>{title}</span>
            )}
          </div>
          <div className="ranking-fighter-meta">
            {fighter.record && <span className="ranking-fighter-record">{fighter.record}</span>}
            {fighter.gym && <span className="ranking-fighter-gym">{fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}</span>}
            {showDivision && fighter.divisions.map(dId => {
              const div = getDivisionById(dId);
              return div ? <span key={dId} className="ranking-fighter-gym">{div.name} {div.weight}</span> : null;
            })}
            {isChampion && titleDate && (
              <span className="ranking-fighter-gym">Since {new Date(titleDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {fighter.instagram && (
          <a
            href={instagramUrl(fighter.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="ranking-instagram"
            onClick={e => e.stopPropagation()}
            title={instagramHandle(fighter.instagram)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        )}
        <svg className="ranking-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
