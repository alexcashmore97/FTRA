import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Small delay so Helmet has time to update document.title
    const timeout = setTimeout(() => {
      window.gtag?.('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);
}
