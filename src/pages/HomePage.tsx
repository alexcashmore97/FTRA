import { useState } from 'react';
import { Link } from 'react-router-dom';
import DivisionCard from '@/components/DivisionCard';
import { getDivisionsByGender } from '@/lib/divisions';
import '@/styles/hero.css';

export default function HomePage() {
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');
  const divisions = getDivisionsByGender(activeGender);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/images/hero/ring-atmosphere.jpg" alt="" className="hero-bg-image" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Australian Muay Thai</div>
          <h1 className="hero-title">
            Where Warriors
            <span className="highlight">Are Ranked</span>
          </h1>
          <p className="hero-subtitle">
            The definitive ranking system for Full Thai Rules fighters across Australia.
            Every division. Every contender. No politics.
          </p>
          <div className="hero-actions">
            <Link to="/rankings/p4p?gender=male" className="btn btn-primary">
              View P4P Rankings
            </Link>
            <a href="#divisions" className="btn btn-outline">
              Browse Divisions
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* Stats */}
      <section className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">24</div>
          <div className="hero-stat-label">Weight Divisions</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">200+</div>
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

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to={`/rankings/p4p?gender=${activeGender}`} className="btn btn-outline">
              View {activeGender === 'male' ? 'Male' : 'Female'} P4P Rankings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
