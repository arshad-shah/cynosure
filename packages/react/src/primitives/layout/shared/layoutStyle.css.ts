import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from './buildResponsive.js';

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
  // `cynosure-lp-grow`, not `lp-fg` — see resolveLayoutProps for context.
  ['flex-grow', 'cynosure-lp-grow'],
  ['flex-shrink', 'cynosure-lp-fs'],
  ['flex-basis', 'cynosure-lp-fb'],
  ['align-self', 'cynosure-lp-as'],
  ['justify-self', 'cynosure-lp-js'],
  ['order', 'cynosure-lp-order'],
];

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
