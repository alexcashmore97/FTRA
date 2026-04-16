import { Link } from 'react-router-dom';
import type { Division } from '@/lib/divisions';

interface Props {
  division: Division;
}

export default function DivisionCard({ division }: Props) {
  const rankingClassname = `division-card-image-${division.name}`.split(' ').join('')

  return (
    <Link to={`/rankings/${division.id}`} className="division-card">
      <div className={`division-card-image`}>
        <img className={`${rankingClassname}`} src={division.image} alt={`${division.gender === 'male' ? 'Male' : 'Female'} ${division.name} ${division.weight} Australian Muay Thai division`} loading="lazy" />
      </div>
      <div className="division-card-content">
        <div className="division-card-name">{division.name}</div>
        <div className="division-card-weight">{division.weight}</div>
      </div>
      <svg className="division-card-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 3l5 5-5 5" />
      </svg>
    </Link>
  );
}
