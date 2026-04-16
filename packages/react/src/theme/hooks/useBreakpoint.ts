import { useEffect, useMemo, useState } from 'react';
import type { Breakpoint } from '../types.js';

const ORDER: readonly Exclude<Breakpoint, 'base'>[] = ['sm', 'md', 'lg', 'xl', '2xl'];

const DEFAULT_QUERIES: Record<Exclude<Breakpoint, 'base'>, string> = {
  sm: '(min-width: 40em)',
  md: '(min-width: 48em)',
  lg: '(min-width: 64em)',
  xl: '(min-width: 80em)',
  '2xl': '(min-width: 96em)',
};

const computeBreakpoint = (queries: readonly string[]): Breakpoint => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'base';
  let current: Breakpoint = 'base';
  for (let i = 0; i < ORDER.length; i++) {
    const query = queries[i];
    if (query && window.matchMedia(query).matches) current = ORDER[i] as Breakpoint;
  }
  return current;
};

/**
 * Returns the largest breakpoint whose media query currently matches. Use
 * this only when CSS responsive styles are not enough — most components
 * should rely on container queries or the responsive props pipeline (Phase
 * 05) instead. SSR-safe: starts at "base" until hydrated.
 */
export function useBreakpoint(
  queries: Partial<Record<Exclude<Breakpoint, 'base'>, string>> = {},
): Breakpoint {
  // The caller almost always passes a fresh object literal, so we key the
  // memo on the resolved query strings rather than the object identity.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above.
  const queryList = useMemo(
    () => ORDER.map((bp) => queries[bp] ?? DEFAULT_QUERIES[bp]),
    [queries.sm, queries.md, queries.lg, queries.xl, queries['2xl']],
  );

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => computeBreakpoint(queryList));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mqls = queryList.map((q) => window.matchMedia(q));
    const handler = () => setBreakpoint(computeBreakpoint(queryList));
    for (const mql of mqls) mql.addEventListener('change', handler);
    handler();
    return () => {
      for (const mql of mqls) mql.removeEventListener('change', handler);
    };
  }, [queryList]);

  return breakpoint;
}
