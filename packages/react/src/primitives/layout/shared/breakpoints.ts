/**
 * Breakpoint tokens mirrored from `@arshad-shah/cynosure-tokens/breakpoints`. Kept in sync
 * with the token definitions. These are the only breakpoints the layout
 * primitives honour. Order matters — `BREAKPOINTS` is consumed in mobile-first
 * order by the responsive utility.
 */
export const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export type Breakpoint = (typeof BREAKPOINTS)[number];

export const MEDIA_QUERIES: Record<Exclude<Breakpoint, 'base'>, string> = {
  sm: '(min-width: 40em)',
  md: '(min-width: 48em)',
  lg: '(min-width: 64em)',
  xl: '(min-width: 80em)',
  '2xl': '(min-width: 96em)',
};

export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
