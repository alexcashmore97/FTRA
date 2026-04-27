import { useEffect, useState } from 'react';
import { getActiveShows } from '@/lib/shows';
import type { Show } from '@/lib/types';
import '@/styles/shows.css';

const ROTATE_MS = 7000;
const VISIBLE_DEPTH = 3;

export default function ShowsCarousel() {
  const [shows, setShows] = useState<Show[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveShows()
      .then(setShows)
      .catch(() => setShows([]))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (shows.length <= 1) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % shows.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [shows.length]);

  if (!loaded || shows.length === 0) return null;

  const total = shows.length;
  const active = shows[index];

  function formatDate(iso: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function slugifyTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 22);
  }

  function trackTicketClick(show: Show) {
    const params = {
      show_id: show.id,
      show_title: show.title || '(untitled)',
      event_date: show.eventDate ?? '',
      ticket_url: show.ticketURL,
    };
    window.gtag?.('event', 'show_ticket_click', params);
    const slug = slugifyTitle(show.title) || show.id.toLowerCase().slice(0, 22);
    if (slug) {
      window.gtag?.('event', `show_ticket_click_${slug}`, params);
    }
  }

  // Signed offset of card i from the active card, wrapped to the shorter
  // direction so the stack is balanced left/right when there are many shows.
  function getRel(i: number): number {
    if (total === 1) return 0;
    let rel = i - index;
    const half = total / 2;
    if (rel > half) rel -= total;
    if (rel <= -half) rel += total;
    return rel;
  }

  const dateLabel = formatDate(active.eventDate);

  return (
    <section className="shows-carousel" aria-label="Upcoming shows">
      <div className="shows-ambient" aria-hidden="true" />

      <div className="shows-stage" role="presentation">
        {shows.map((show, i) => {
          const rel = getRel(i);
          const abs = Math.abs(rel);
          const visible = abs <= VISIBLE_DEPTH;
          const isActive = rel === 0;

          return (
            <button
              key={show.id}
              type="button"
              className={`shows-card ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
              aria-label={isActive ? undefined : `Bring ${show.title || 'show'} to front`}
              tabIndex={isActive ? -1 : 0}
              style={{
                ['--rel' as never]: rel,
                ['--abs' as never]: abs,
                visibility: visible ? 'visible' : 'hidden',
                pointerEvents: visible && !isActive ? 'auto' : isActive ? 'none' : 'none',
              }}
              onClick={() => !isActive && setIndex(i)}
            >
              <div className="shows-card-frame">
                <img
                  src={show.imageURL}
                  alt={show.title || 'Upcoming show'}
                  loading="lazy"
                  className="shows-card-image"
                />
                <div className="shows-card-glare" />
                <div className="shows-card-veil" />
              </div>
              <div className="shows-card-floor" aria-hidden="true">
                <img src={show.imageURL} alt="" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="shows-marquee">
        {active.title && <h2 className="shows-title">{active.title}</h2>}
        {dateLabel && <div className="shows-date">{dateLabel}</div>}
        {active.ticketURL && (
          <a
            href={active.ticketURL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary shows-cta"
            onClick={() => trackTicketClick(active)}
            onAuxClick={() => trackTicketClick(active)}
          >
            Buy Tickets
          </a>
        )}
      </div>

      {total > 1 && (
        <>
          <button
            className="shows-nav shows-nav-prev"
            aria-label="Previous show"
            onClick={() => setIndex(i => (i - 1 + total) % total)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="shows-nav shows-nav-next"
            aria-label="Next show"
            onClick={() => setIndex(i => (i + 1) % total)}
          >
            <span aria-hidden="true">›</span>
          </button>


          <div className="shows-dots" role="tablist" aria-label="Select show">
            {shows.map((_, i) => (
              <button
                key={i}
                className={`shows-dot ${i === index ? 'active' : ''}`}
                aria-label={`Show ${i + 1}`}
                aria-selected={i === index}
                role="tab"
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
