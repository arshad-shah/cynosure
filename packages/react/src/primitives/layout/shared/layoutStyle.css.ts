import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from './buildResponsive.js';

/**
 * Map of layout-prop → CSS property + the custom-property "base name" that
 * carries its value at each breakpoint. The name chain ensures that gaps in
 * the breakpoint map fall back to the closest lower breakpoint (and
 * ultimately to `initial`), so `{ base: 2, md: 4 }` renders as `padding: 2`
 * on mobile and `padding: 4` from md upward.
 */
// Every longhand entry that has a shorthand counterpart in the same rule
// MUST declare its shorthand var base as the third tuple element. Without
// it, setting only the shorthand prop (e.g. `padding="8"`) leaves the
// longhand vars unset; with @property-registered vars, the longhand
// `padding-top: var(--cynosure-lp-pt-base)` declaration then resolves to
// "invalid at computed value time", reverts to padding-top's initial value
// of 0, and overrides the shorthand. The shorthand fallback in `cascade()`
// keeps the longhand's var() chain falling through to the parent shorthand
// var so the cascade stays consistent in both directions.
// Each longhand entry that shares a shorthand MUST chain its fallbacks in
// CSS-shorthand hierarchy order: TLBR → inline/block → all-sides. Without
// this, setting only `padding="2"` would emit `padding: 2rem` first, then
// each longhand `padding-top: var(--pt-base)` etc. would resolve to IACVT,
// revert to 0, and clobber the shorthand expansion. With the chain, an
// unset `--pt-base` falls through to `--py-base`, then `--p-base`, so the
// cascade stays consistent in both directions.
const LAYOUT_PROPS: ReadonlyArray<readonly [string, string, ...string[]]> = [
  // spacing
  ['padding', 'cynosure-lp-p'],
  ['padding-inline', 'cynosure-lp-px', 'cynosure-lp-p'],
  ['padding-block', 'cynosure-lp-py', 'cynosure-lp-p'],
  ['padding-top', 'cynosure-lp-pt', 'cynosure-lp-py', 'cynosure-lp-p'],
  ['padding-right', 'cynosure-lp-pr', 'cynosure-lp-px', 'cynosure-lp-p'],
  ['padding-bottom', 'cynosure-lp-pb', 'cynosure-lp-py', 'cynosure-lp-p'],
  ['padding-left', 'cynosure-lp-pl', 'cynosure-lp-px', 'cynosure-lp-p'],
  ['margin', 'cynosure-lp-m'],
  ['margin-inline', 'cynosure-lp-mx', 'cynosure-lp-m'],
  ['margin-block', 'cynosure-lp-my', 'cynosure-lp-m'],
  ['margin-top', 'cynosure-lp-mt', 'cynosure-lp-my', 'cynosure-lp-m'],
  ['margin-right', 'cynosure-lp-mr', 'cynosure-lp-mx', 'cynosure-lp-m'],
  ['margin-bottom', 'cynosure-lp-mb', 'cynosure-lp-my', 'cynosure-lp-m'],
  ['margin-left', 'cynosure-lp-ml', 'cynosure-lp-mx', 'cynosure-lp-m'],
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
  ['overflow-x', 'cynosure-lp-ovx', 'cynosure-lp-ov'],
  ['overflow-y', 'cynosure-lp-ovy', 'cynosure-lp-ov'],
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
