import { useEffect, useState } from 'react';

export interface UseMediaQueryOptions {
  /** Value returned on first render when `window.matchMedia` is unavailable (SSR). */
  defaultValue?: boolean;
}

const readMatch = (query: string): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(query).matches;
};

/**
 * Reactive wrapper around `window.matchMedia`. Returns `false` during SSR
 * (overridable via `defaultValue`) and updates whenever the media query
 * flips.
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;

  const [matches, setMatches] = useState<boolean>(() =>
    typeof window === 'undefined' ? defaultValue : readMatch(query),
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
