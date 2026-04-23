import { MEDIA_QUERIES } from './breakpoints.js';

type BpLadder = Array<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;

/**
 * Build nested `var()` fallbacks: `var(--x-md, var(--x-sm, var(--x-base)))`.
 * Ensures that unset higher breakpoints inherit from the nearest lower one.
 */
export const cascade = (base: string, bps: BpLadder): string => {
  let expr = `var(--${base}-base)`;
  for (const bp of bps) {
    if (bp === 'base') continue;
    expr = `var(--${base}-${bp}, ${expr})`;
  }
  return expr;
};

export const BP_LADDERS: Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', BpLadder> = {
  base: ['base'],
  sm: ['base', 'sm'],
  md: ['base', 'sm', 'md'],
  lg: ['base', 'sm', 'md', 'lg'],
  xl: ['base', 'sm', 'md', 'lg', 'xl'],
  '2xl': ['base', 'sm', 'md', 'lg', 'xl', '2xl'],
};

/**
 * Build a responsive rule set from a map of CSS property → var base name.
 * Each entry becomes a `cascade()` expression at every breakpoint ladder.
 * Layout primitives call this from their `.css.ts` to wire responsive props
 * into the `@media` cascade without duplicating the cascade logic.
 */
export const buildResponsiveRules = (
  entries: Array<[string, string]>,
): { base: Record<string, string>; media: Record<string, Record<string, string>> } => {
  const at = (bps: BpLadder): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [prop, base] of entries) out[prop] = cascade(base, bps);
    return out;
  };
  return {
    base: at(BP_LADDERS.base),
    media: {
      [MEDIA_QUERIES.sm]: at(BP_LADDERS.sm),
      [MEDIA_QUERIES.md]: at(BP_LADDERS.md),
      [MEDIA_QUERIES.lg]: at(BP_LADDERS.lg),
      [MEDIA_QUERIES.xl]: at(BP_LADDERS.xl),
      [MEDIA_QUERIES['2xl']]: at(BP_LADDERS['2xl']),
    },
  };
};
