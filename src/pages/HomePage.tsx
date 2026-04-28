import { useState, useEffect } from 'react';
import DivisionCard from '@/components/DivisionCard';
import ShowsCarousel from '@/components/ShowsCarousel';
import MarketMoversCarousel from '@/components/MarketMoversCarousel';
import { getDivisionsByGender } from '@/lib/divisions';
import { getFighterCount } from '@/lib/fighters';
import SEO from '@/components/SEO';
import '@/styles/hero.css';

export default function HomePage() {
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');
  const [fighterCount, setFighterCount] = useState<number | null>(null);
  const divisions = getDivisionsByGender(activeGender);

  useEffect(() => {
    getFighterCount().then(setFighterCount).catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="Australian Muay Thai Rankings | Full Thai Rules Australia"
        description="Official Australian Muay Thai rankings across 24 weight divisions. The home of Full Thai Rules Australia — honouring the warriors of Australian Muay Thai."
        path="/"
      />
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/images/hero/ring-atmosphere.jpg" alt="Muay Thai ring atmosphere" className="hero-bg-image" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Full Thai Rules Australia</div>
          <h1 className="hero-title">
            Honouring the Warriors
            <span className="highlight">of Australian Muay Thai</span>
          </h1>
          <p className="hero-subtitle">
            At Full Thai Rules Australia, we are committed to shining a spotlight on the warriors of Australian Muay Thai. <br /><br/>Our mission is to celebrate their dedication, skill, and sacrifices, ensuring they receive the recognition and respect they truly deserve. 
          </p>
          <div className="hero-actions">
            <a href="#divisions" className="btn btn-primary">
              Browse Divisions
            </a>
          </div>
        </div>

      </section>

      {/* Upcoming shows carousel — renders nothing if no active shows */}
      <ShowsCarousel />

      {/* Market Movers — recently ranked-up fighters */}
      <MarketMoversCarousel />

      {/* Stats */}
      <section className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">24</div>
          <div className="hero-stat-label">Weight Divisions</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{fighterCount ?? '—'}</div>
          <div className="hero-stat-label">Ranked Fighters</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">8</div>
          <div className="hero-stat-label">States & Territories</div>
        </div>
      </section>

      {/* Divisions */}
      <section id="divisions" className="section">
        <div className="container">
          <div className="section-header">
            <div className="label">Official Rankings</div>
            <h2>Divisions</h2>
          </div>

          <div className="rankings-gender-tabs" style={{ marginBottom: '32px' }}>
            <button
              className={`gender-tab ${activeGender === 'male' ? 'active' : ''}`}
              onClick={() => setActiveGender('male')}
            >
              Male
            </button>
            <button
              className={`gender-tab ${activeGender === 'female' ? 'active' : ''}`}
              onClick={() => setActiveGender('female')}
            >
              Female
            </button>
          </div>

          <div className="divisions-grid">
            {divisions.map(div => (
              <DivisionCard key={div.id} division={div} />
            ))}
          </div>

          {/* TODO: uncomment when P4P rankings are populated
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to={`/rankings/p4p?gender=${activeGender}`} className="btn btn-outline">
              View {activeGender === 'male' ? 'Male' : 'Female'} P4P Rankings
            </Link>
          </div>
          */}
        </div>
      </section>
    </>
  );
}
