import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const readPreference = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
};

/**
 * Returns `true` when the user has requested reduced motion. Components that
 * animate must check this and either disable or shorten the animation. The
 * CSS-level fallback in `@lumen/tokens/css` already zeroes the
 * `--lumen-duration-motion-*` values, so transitions driven by tokens are
 * automatically covered.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(readPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
