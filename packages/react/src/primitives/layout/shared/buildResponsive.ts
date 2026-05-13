import { MEDIA_QUERIES } from './breakpoints.js';

type BpLadder = Array<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;

/**
 * Build nested `var()` fallbacks: `var(--x-md, var(--x-sm, var(--x-base)))`.
 * Ensures that unset higher breakpoints inherit from the nearest lower one.
 *
 * `shorthandFallbacks`, if given, appends nested `var()` fallbacks at the
 * base level so a longhand-bound declaration can resolve through to its
 * parent shorthand vars when the longhand vars are unset. For padding-top
 * the chain is `--pt-base → --py-base → --p-base`, matching the CSS
 * shorthand hierarchy (top → block → all-sides). With @property registered
 * vars, an unset `--pt-base` would otherwise resolve to "invalid at
 * computed value time" and revert padding-top to its initial (0), beating
 * the shorthand expansion. See `layoutStyle.css.ts` for which props use
 * which chain.
 */
export const cascade = (
  base: string,
  bps: BpLadder,
  shorthandFallbacks: ReadonlyArray<string> = [],
): string => {
  // Build inside-out: innermost fallback is the last-priority shorthand.
  let expr: string;
  if (shorthandFallbacks.length === 0) {
    expr = `var(--${base}-base)`;
  } else {
    // Right-most fallback first (deepest in the chain), no further fallback.
    expr = `var(--${shorthandFallbacks[shorthandFallbacks.length - 1]}-base)`;
    // Wrap each preceding fallback around it, then `--base-base` last.
    for (let i = shorthandFallbacks.length - 2; i >= 0; i--) {
      expr = `var(--${shorthandFallbacks[i]}-base, ${expr})`;
    }
    expr = `var(--${base}-base, ${expr})`;
  }
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
// Allow each entry to be either `[prop, base]` (no fallback), or
// `[prop, base, ...fallbacks]` where the fallbacks are tried in order at the
// base breakpoint when the longhand var is unset.
type LayoutPropEntry = readonly [string, string, ...string[]];

export const buildResponsiveRules = (
  entries: ReadonlyArray<LayoutPropEntry>,
): { base: Record<string, string>; media: Record<string, Record<string, string>> } => {
  const at = (bps: BpLadder): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const entry of entries) {
      const [prop, base, ...shorthandFallbacks] = entry;
      out[prop] = cascade(base, bps, shorthandFallbacks);
    }
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
