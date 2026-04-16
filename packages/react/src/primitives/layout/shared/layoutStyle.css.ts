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
  ['padding', 'lumen-lp-p'],
  ['padding-inline', 'lumen-lp-px'],
  ['padding-block', 'lumen-lp-py'],
  ['padding-top', 'lumen-lp-pt'],
  ['padding-right', 'lumen-lp-pr'],
  ['padding-bottom', 'lumen-lp-pb'],
  ['padding-left', 'lumen-lp-pl'],
  ['margin', 'lumen-lp-m'],
  ['margin-inline', 'lumen-lp-mx'],
  ['margin-block', 'lumen-lp-my'],
  ['margin-top', 'lumen-lp-mt'],
  ['margin-right', 'lumen-lp-mr'],
  ['margin-bottom', 'lumen-lp-mb'],
  ['margin-left', 'lumen-lp-ml'],
  // size
  ['width', 'lumen-lp-w'],
  ['height', 'lumen-lp-h'],
  ['min-width', 'lumen-lp-minw'],
  ['max-width', 'lumen-lp-maxw'],
  ['min-height', 'lumen-lp-minh'],
  ['max-height', 'lumen-lp-maxh'],
  // visual
  ['background', 'lumen-lp-bg'],
  ['color', 'lumen-lp-fg'],
  ['border-color', 'lumen-lp-bc'],
  ['border-width', 'lumen-lp-bw'],
  ['border-style', 'lumen-lp-bs'],
  ['border-radius', 'lumen-lp-br'],
  ['box-shadow', 'lumen-lp-sh'],
  ['opacity', 'lumen-lp-op'],
  ['overflow', 'lumen-lp-ov'],
  ['overflow-x', 'lumen-lp-ovx'],
  ['overflow-y', 'lumen-lp-ovy'],
  // display / position
  ['display', 'lumen-lp-d'],
  ['position', 'lumen-lp-pos'],
  ['top', 'lumen-lp-top'],
  ['right', 'lumen-lp-right'],
  ['bottom', 'lumen-lp-bottom'],
  ['left', 'lumen-lp-left'],
  ['z-index', 'lumen-lp-z'],
  // grid child hints
  ['grid-column', 'lumen-lp-gc'],
  ['grid-row', 'lumen-lp-gr'],
  ['grid-area', 'lumen-lp-ga'],
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
 * Consumers set the `--lumen-lp-*-{bp}` custom properties via inline style
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
