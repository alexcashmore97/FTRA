import { Link } from 'react-router-dom';
import type { Fighter } from '@/lib/types';

interface Props {
  fighter: Fighter;
  showDivision?: boolean;
}

export default function RankingRow({ fighter, showDivision = false }: Props) {
  const isChampion = fighter.titleHolder;
  const isTopFive = (fighter.rank ?? 99) <= 5;
  const initials = `${fighter.firstName?.[0] ?? ''}${fighter.lastName?.[0] ?? ''}`;

  return (
    <Link to={`/fighters/${fighter.id}`} className={`ranking-row ${isChampion ? 'champion' : ''}`}>
      <div className={`rank-badge ${isChampion ? 'champion' : isTopFive ? 'top-five' : ''}`}>
        {isChampion ? 'C' : fighter.rank ?? '—'}
      </div>

      <div className="ranking-fighter-info">
        <div className="ranking-fighter-photo">
          {fighter.photoURL
            ? <img src={fighter.photoURL} alt={`${fighter.firstName} ${fighter.lastName}`} />
            : initials
          }
        </div>
        <div>
          <div className="ranking-fighter-name">
            {fighter.firstName} {fighter.lastName}
          </div>
          <div className="ranking-fighter-meta">
            {fighter.record && <span className="ranking-fighter-record">{fighter.record}</span>}
            {fighter.gym && <span className="ranking-fighter-gym">{fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}</span>}
            {showDivision && <span className="ranking-fighter-gym">{fighter.weightClass}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isChampion && <span className="ranking-title-badge">Champion</span>}
        <svg className="ranking-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
