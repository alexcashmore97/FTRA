import { useEffect, useRef, useState } from 'react';
import { getActivePosts } from '@/lib/posts';
import type { Post } from '@/lib/types';
import '@/styles/posts.css';

export default function PostsCarousel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getActivePosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoaded(true));
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [activeId]);

  // Close on Escape
  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId]);

  if (!loaded || posts.length === 0) return null;

  const active = posts.find(p => p.id === activeId) ?? null;

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.posts-card');
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section className="posts-section" aria-label="Latest posts">
      <div className="posts-header">
        <div className="posts-eyebrow">
          <span className="posts-eyebrow-dot" /> Full Thai Rules Podcast and News
        </div>
        <h2 className="posts-headline">Latest Posts</h2>
      </div>

      <div className="posts-track-wrap">
        <div className="posts-track" ref={trackRef} role="list">
          {posts.map(post => (
            <button
              key={post.id}
              type="button"
              role="listitem"
              className="posts-card"
              onClick={() => setActiveId(post.id)}
              aria-label={`${post.type === 'video' ? 'Watch' : 'Read'}: ${post.title || 'Post'}`}
            >
              <div className="posts-card-cover">
                {post.coverImageURL ? (
                  <img src={post.coverImageURL} alt="" loading="lazy" />
                ) : post.type === 'video' && post.youtubeId ? (
                  <img
                    src={`https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="posts-card-cover-fallback" />
                )}
                <span className={`posts-card-tag posts-card-tag--${post.type}`}>
                  {post.type === 'video' ? 'Watch' : 'Read'}
                </span>
              </div>
              <div className="posts-card-body">
                {post.title && <h3 className="posts-card-title">{post.title}</h3>}
                {post.excerpt && <p className="posts-card-excerpt">{post.excerpt}</p>}
                <span className="posts-card-cta">
                  {post.type === 'video' ? 'Play video' : 'Read post'} →
                </span>
              </div>
            </button>
          ))}
        </div>

        {posts.length > 1 && (
          <>
            <button
              type="button"
              className="posts-nav posts-nav-prev"
              aria-label="Previous post"
              onClick={() => scrollByCard(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className="posts-nav posts-nav-next"
              aria-label="Next post"
              onClick={() => scrollByCard(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {active && (
        <div
          className="posts-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="posts-modal-title"
          onClick={() => setActiveId(null)}
        >
          <div className="posts-modal" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="posts-modal-close"
              aria-label="Close"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>

            {active.type === 'video' && active.youtubeId ? (
              <div className="posts-modal-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=0&rel=0`}
                  title={active.title || 'Video'}
                  frameBorder={0}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : null}

            <div className="posts-modal-body">
              {active.title && (
                <h2 id="posts-modal-title" className="posts-modal-title">{active.title}</h2>
              )}
              {active.type === 'text' && active.body && (
                <div className="posts-modal-text">
                  {active.body.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
              {active.type === 'video' && active.body && (
                <div className="posts-modal-text">
                  {active.body.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
