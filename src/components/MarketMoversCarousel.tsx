import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarketMovers } from '@/lib/marketmovers';
import type { MarketMover } from '@/lib/marketmovers';
import '@/styles/marketmovers.css';

const ROTATE_MS = 5000;

export default function MarketMoversCarousel() {
  const [movers, setMovers] = useState<MarketMover[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMarketMovers()
      .then(setMovers)
      .catch(() => setMovers([]))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (movers.length <= 1) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % movers.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [movers.length]);

  if (!loaded || movers.length === 0) return null;

  const total = movers.length;
  const active = movers[index];

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function rankDelta(m: MarketMover): number | null {
    if (m.previousRank == null) return null;
    return m.previousRank - m.newRank;
  }

  return (
    <section className="mm-carousel" aria-label="Market movers">
      <div className="mm-haze" aria-hidden="true">
        <div className="mm-haze-blob mm-haze-blob-a" />
        <div className="mm-haze-blob mm-haze-blob-b" />
        <div className="mm-haze-blob mm-haze-blob-c" />
      </div>

     <div style={{position:'relative'}} >
      <div className='mm-container-float'>
 <div className="mm-eyebrow">
        <span className="mm-eyebrow-dot" /> Market Movers
      </div> 
      <h2 className="mm-headline">
        On The Rise
      </h2>
      </div>
      </div>

      <div className="mm-stage" aria-label="Recently ranked-up fighters">
        
        {movers.map((m, i) => {
          const isActive = i === index;
          const showBg = m.showImageURL;
          const delta = rankDelta(m);

          return (
            <Link
              key={m.id}
              to={`/fighters/${m.id}`}
              className={`mm-card ${isActive ? 'is-active' : ''}`}
              aria-label={`${m.fighterName} — view profile`}
            >
              <div className="mm-pane-bg" aria-hidden="true">
                {showBg ? (<>
                   <img src={showBg} alt="" loading="lazy" />
                                <div className="mm-pane-bg-veil" /></>
               
                ) : (
                  <div/>
                )}

              </div>

              <div className="mm-pane" aria-hidden="true">
                <div className="mm-pane-edge mm-pane-edge-l" />
                <div className="mm-pane-edge mm-pane-edge-r" />
              </div>

              <div className="mm-pane-inner">
                <div className="mm-tile">
                  <div className="mm-tile-photo">
                    {m.photoURL ? (
                      <img src={m.photoURL} alt={m.fighterName} loading="lazy" />
                    ) : (
                      <div className="mm-tile-photo-fallback">
                        <span>{initials(m.fighterName)}</span>
                      </div>
                    )}
                    <div className="mm-tile-photo-fade" />
                  </div>

                  <div className="mm-tile-info">
                    <div className="mm-tile-name">{m.fighterName}</div>

                    <div className="mm-tile-rank">
                      <div className="mm-tile-rank-label">New Rank</div>
                      <div className="mm-tile-rank-value">
                        <span className="mm-rank-hash">#</span>
                        {m.newRank}
                      </div>
                      {delta != null && delta > 0 && (
                        <div className="mm-tile-delta">
                          <span aria-hidden="true">▲</span> {delta}
                        </div>
                      )}
                    </div>

                    <div className="mm-tile-meta">
                      <div className="mm-tile-gym">{m.gym}</div>
                      <div className="mm-tile-weight">{m.weightClass}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mm-footer">
        <div className="mm-footer-name">{active.fighterName}</div>
        {total > 1 && (
          <div className="mm-dots" role="tablist" aria-label="Select fighter">
            {movers.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`mm-dot ${i === index ? 'active' : ''}`}
                aria-label={`Mover ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
