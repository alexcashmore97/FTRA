import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG = 'ftra:chunk-reload-attempted';

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : '';
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [^ ]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

/**
 * lazy() wrapper that retries a transient import failure once, then — if it
 * still fails because the cached SPA shell references a stale chunk hash —
 * forces a hard reload to pull a fresh index.html. Prevents Suspense from
 * sitting on the spinner forever after a deploy on iOS/Android home-screen apps.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): ReturnType<typeof lazy<T>> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      try {
        await new Promise((r) => setTimeout(r, 400));
        return await factory();
      } catch (err2) {
        if (isChunkLoadError(err2) && typeof window !== 'undefined') {
          const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG);
          if (!alreadyReloaded) {
            sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
            return await new Promise<{ default: T }>(() => {});
          }
        }
        throw err2;
      }
    }
  });
}

export function clearChunkReloadFlag(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(RELOAD_FLAG);
  }
}
