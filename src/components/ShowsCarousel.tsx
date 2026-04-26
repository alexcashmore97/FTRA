import { useEffect, useState } from 'react';
import { getActiveShows } from '@/lib/shows';
import type { Show } from '@/lib/types';
import '@/styles/shows.css';

const ROTATE_MS = 6000;

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
    // Generic event — covers all shows in one report
    window.gtag?.('event', 'show_ticket_click', params);
    // Per-show event — easy to filter/pin in GA without setting up custom dimensions
    const slug = slugifyTitle(show.title) || show.id.toLowerCase().slice(0, 22);
    if (slug) {
      window.gtag?.('event', `show_ticket_click_${slug}`, params);
    }
  }

  return (
    <section className="shows-carousel" aria-label="Upcoming shows">
      {shows.map((show, i) => (
        <div
          key={show.id}
          className={`shows-slide ${i === index ? 'active' : ''}`}
          aria-hidden={i !== index}
        >
          <img src={show.imageURL} alt={show.title || 'Upcoming show'} className="shows-slide-image" />
          <div className="shows-slide-overlay" />
          <div className="shows-slide-content">
            <div className="shows-eyebrow">Upcoming Show</div>
            {show.title && <h2 className="shows-title">{show.title}</h2>}
            {formatDate(show.eventDate) && (
              <div className="shows-date">{formatDate(show.eventDate)}</div>
            )}
            {show.ticketURL && (
              <a
                href={show.ticketURL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary shows-cta"
                onClick={() => trackTicketClick(show)}
                onAuxClick={() => trackTicketClick(show)}
              >
                Buy Tickets
              </a>
            )}
          </div>
        </div>
      ))}

      {shows.length > 1 && (
        <>
          <button
            className="shows-nav shows-nav-prev"
            aria-label="Previous show"
            onClick={() => setIndex(i => (i - 1 + shows.length) % shows.length)}
          >
            ‹
          </button>
          <button
            className="shows-nav shows-nav-next"
            aria-label="Next show"
            onClick={() => setIndex(i => (i + 1) % shows.length)}
          >
            ›
          </button>
          <div className="shows-dots" role="tablist">
            {shows.map((_, i) => (
              <button
                key={i}
                className={`shows-dot ${i === index ? 'active' : ''}`}
                aria-label={`Show slide ${i + 1}`}
                aria-selected={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
