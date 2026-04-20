import { style } from '@vanilla-extract/css';
import { MEDIA_QUERIES } from './breakpoints.js';

/**
 * Map of layout-prop → CSS property + the custom-property "base name" that
 * carries its value at each breakpoint. The name chain ensures that gaps in
 * the breakpoint map fall back to the closest lower breakpoint (and
 * ultimately to `initial`), so `{ base: 2, md: 4 }` renders as `padding: 2`
 * on mobile and `padding: 4` from md upward.
 */
const LAYOUT_PROPS: Array<[string, string]> = [
  // spacing
  ['padding', 'cynosure-lp-p'],
  ['padding-inline', 'cynosure-lp-px'],
  ['padding-block', 'cynosure-lp-py'],
  ['padding-top', 'cynosure-lp-pt'],
  ['padding-right', 'cynosure-lp-pr'],
  ['padding-bottom', 'cynosure-lp-pb'],
  ['padding-left', 'cynosure-lp-pl'],
  ['margin', 'cynosure-lp-m'],
  ['margin-inline', 'cynosure-lp-mx'],
  ['margin-block', 'cynosure-lp-my'],
  ['margin-top', 'cynosure-lp-mt'],
  ['margin-right', 'cynosure-lp-mr'],
  ['margin-bottom', 'cynosure-lp-mb'],
  ['margin-left', 'cynosure-lp-ml'],
  // size
  ['width', 'cynosure-lp-w'],
  ['height', 'cynosure-lp-h'],
  ['min-width', 'cynosure-lp-minw'],
  ['max-width', 'cynosure-lp-maxw'],
  ['min-height', 'cynosure-lp-minh'],
  ['max-height', 'cynosure-lp-maxh'],
  // visual
  ['background', 'cynosure-lp-bg'],
  ['color', 'cynosure-lp-fg'],
  ['border-color', 'cynosure-lp-bc'],
  ['border-width', 'cynosure-lp-bw'],
  ['border-style', 'cynosure-lp-bs'],
  ['border-radius', 'cynosure-lp-br'],
  ['box-shadow', 'cynosure-lp-sh'],
  ['opacity', 'cynosure-lp-op'],
  ['overflow', 'cynosure-lp-ov'],
  ['overflow-x', 'cynosure-lp-ovx'],
  ['overflow-y', 'cynosure-lp-ovy'],
  // display / position
  ['display', 'cynosure-lp-d'],
  ['position', 'cynosure-lp-pos'],
  ['top', 'cynosure-lp-top'],
  ['right', 'cynosure-lp-right'],
  ['bottom', 'cynosure-lp-bottom'],
  ['left', 'cynosure-lp-left'],
  ['z-index', 'cynosure-lp-z'],
  // grid child hints
  ['grid-column', 'cynosure-lp-gc'],
  ['grid-row', 'cynosure-lp-gr'],
  ['grid-area', 'cynosure-lp-ga'],
  // flex-child hints
  ['flex', 'cynosure-lp-flex'],
  ['flex-grow', 'cynosure-lp-fg'],
  ['flex-shrink', 'cynosure-lp-fs'],
  ['flex-basis', 'cynosure-lp-fb'],
  ['align-self', 'cynosure-lp-as'],
  ['justify-self', 'cynosure-lp-js'],
  ['order', 'cynosure-lp-order'],
];

type BpLadder = Array<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;

/**
 * Build nested `var()` fallbacks: `var(--x-md, var(--x-sm, var(--x-base)))`.
 * Ensures that unset higher breakpoints inherit from the nearest lower one.
 * Exported so individual layout primitives can build their own responsive
 * rules without re-implementing the cascade.
 */
export const cascade = (base: string, bps: BpLadder): string => {
  let expr = `var(--${base}-base)`;
  for (const bp of bps) {
    if (bp === 'base') continue;
    expr = `var(--${base}-${bp}, ${expr})`;
  }
  return expr;
};

/** The ascending breakpoint ladders used for `@media` rule bodies. */
export const BP_LADDERS: Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', BpLadder> = {
  base: ['base'],
  sm: ['base', 'sm'],
  md: ['base', 'sm', 'md'],
  lg: ['base', 'sm', 'md', 'lg'],
  xl: ['base', 'sm', 'md', 'lg', 'xl'],
  '2xl': ['base', 'sm', 'md', 'lg', 'xl', '2xl'],
};

/**
 * Build a responsive rule set from a map of CSS properties → var base names.
 * Each entry becomes a `cascade()` expression at every breakpoint ladder.
 * This is the shared helper every layout primitive's `.css.ts` uses to wire
 * its responsive props into the `@media` cascade without duplicating logic.
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

const LAYOUT_RULES = buildResponsiveRules(LAYOUT_PROPS);

/**
 * The shared layout-prop base class. Every layout primitive composes this so
 * that `LayoutProps` render identically across them.
 *
 * Consumers set the `--cynosure-lp-*-{bp}` custom properties via inline style
 * (handled by `resolveLayoutProps`). The cascading `var()` fallbacks here
 * ensure that unset higher breakpoints inherit from the nearest lower one.
 */
export const layoutPropsStyle = style({
  ...LAYOUT_RULES.base,
  '@media': LAYOUT_RULES.media,
});
