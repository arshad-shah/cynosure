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
];

const cascade = (base: string, bps: Array<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>): string => {
  // Build nested `var()` fallbacks: var(--x-md, var(--x-sm, var(--x-base)))
  let expr = `var(--${base}-base)`;
  for (const bp of bps) {
    if (bp === 'base') continue;
    expr = `var(--${base}-${bp}, ${expr})`;
  }
  return expr;
};

const buildRule = (
  bpsUpTo: Array<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>,
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [prop, base] of LAYOUT_PROPS) {
    out[prop] = cascade(base, bpsUpTo);
  }
  return out;
};

const LAYOUT_PROPS_BASE = buildRule(['base']);
const LAYOUT_PROPS_SM = buildRule(['base', 'sm']);
const LAYOUT_PROPS_MD = buildRule(['base', 'sm', 'md']);
const LAYOUT_PROPS_LG = buildRule(['base', 'sm', 'md', 'lg']);
const LAYOUT_PROPS_XL = buildRule(['base', 'sm', 'md', 'lg', 'xl']);
const LAYOUT_PROPS_2XL = buildRule(['base', 'sm', 'md', 'lg', 'xl', '2xl']);

/**
 * The shared layout-prop base class. Every layout primitive composes this so
 * that `LayoutProps` render identically across them.
 *
 * Consumers set the `--cynosure-lp-*-{bp}` custom properties via inline style
 * (handled by `resolveLayoutProps`). The cascading `var()` fallbacks here
 * ensure that unset higher breakpoints inherit from the nearest lower one.
 */
export const layoutPropsStyle = style({
  ...LAYOUT_PROPS_BASE,
  '@media': {
    [MEDIA_QUERIES.sm]: LAYOUT_PROPS_SM,
    [MEDIA_QUERIES.md]: LAYOUT_PROPS_MD,
    [MEDIA_QUERIES.lg]: LAYOUT_PROPS_LG,
    [MEDIA_QUERIES.xl]: LAYOUT_PROPS_XL,
    [MEDIA_QUERIES['2xl']]: LAYOUT_PROPS_2XL,
  },
});
