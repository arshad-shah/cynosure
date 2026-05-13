import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const enter = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});
const exit = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-4px)' },
});

export const navigationMenuRoot = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'max-content',
});

export const navigationMenuList = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navigationMenuTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['3'],
  background: 'transparent',
  border: 'none',
  color: vars.color.foreground.default,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontSize: 'var(--cynosure-font-body-md-size)',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  outline: 'none',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover, &[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: vars.shadow.focusRing,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const navigationMenuCaret = style({
  display: 'inline-flex',
  alignItems: 'center',
  flex: '0 0 auto',
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

// Forward-declare the viewport class so `navigationMenuContent` can reference
// it in its descendant selector. Defined fully below.
const _viewportClass = style({});

/*
 * Positioning + animation shell only. Surface visuals (background, border,
 * radius, shadow) come from the `<Card variant="elevated">` rendered inside
 * `<NavigationMenuContent>`; we don't restate those rules here.
 *
 * Radix supports two configurations and the positioning has to match each:
 *
 *   1. **No `<Viewport>`** (default rules below): Content lives directly
 *      under the `<Item>`. We position it absolute below the trigger row
 *      (`top: 100%`) sized to its own content (`width: max-content`) so the
 *      inner mega-menu grid never overflows the panel.
 *
 *   2. **With `<Viewport>`** (`${_viewportClass} &` selector): Radix renders
 *      Content as a direct child of the Viewport node, which sizes itself
 *      via `--radix-navigation-menu-viewport-{width,height}`. Content must
 *      then fill the Viewport (`top: 0; left: 0; width: 100%`); otherwise
 *      our default `top: 100%` would push Content out of the Viewport box
 *      and the panel would appear empty. (`data-motion` isn't a reliable
 *      discriminator — Radix only sets it during transitions, not on a
 *      steady-state open panel.)
 */
export const navigationMenuContent = style({
  position: 'absolute',
  top: '100%',
  insetInlineStart: 0,
  marginBlockStart: vars.space['2'],
  width: 'max-content',
  // Hard cap on width so wide mega-menus can never escape the browser
  // viewport horizontally — `100vw` minus a gutter on each side keeps the
  // panel inside the page no matter where the trigger sits.
  maxWidth: `calc(100vw - 2 * ${vars.space['4']})`,
  // See note in the JSX: kept as the raw CSS var so the value cascades. The
  // previous `Number(vars.z.dropdown)` resolved to `NaN`, which browsers drop.
  zIndex: vars.z.dropdown as unknown as number,
  selectors: {
    // Inside `<Viewport>`, the Viewport sizes itself from the active
    // Content's natural width (Radix sets `--radix-navigation-menu-viewport-
    // width/height` from a ResizeObserver). The default `top: 100%` /
    // `marginBlockStart` we use without a Viewport would push Content out of
    // the Viewport box; flatten them here. We deliberately keep
    // `width: max-content` (don't switch to `100%`) so Radix can read an
    // intrinsic measurement — `100%` of a Viewport that hasn't measured yet
    // collapses to 0 and the panel renders empty.
    [`${_viewportClass} &`]: {
      top: 0,
      insetInlineStart: 0,
      marginBlockStart: 0,
    },
    '&[data-state="open"]': {
      animation: `${enter} ${vars.duration.fast} ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${exit} ${vars.duration.fast} ease-in`,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadow.focusRing,
    },
    '[data-cynosure-reduced-motion] &': {
      animation: 'none',
    },
  },
});

export const navigationMenuLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['3'],
  color: vars.color.foreground.default,
  textDecoration: 'none',
  borderRadius: vars.radius.sm,
  fontSize: 'var(--cynosure-font-body-md-size)',
  fontWeight: 500,
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadow.focusRing,
    },
    '&[data-active="true"]': {
      color: vars.color.accent.solid,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const navigationMenuIndicator = style({
  position: 'relative',
  // Sits in the gap that `navigationMenuViewportWrapper` opens with its
  // `marginBlockStart` — slots the caret between the trigger row and the
  // panel rather than tucking it under the panel where it'd disappear.
  top: '100%',
  display: 'flex',
  height: vars.space['2'],
  alignItems: 'flex-end',
  justifyContent: 'center',
  zIndex: vars.z.dropdown as unknown as number,
  opacity: 0,
  transitionProperty: 'width, transform, opacity',
  transitionDuration: vars.duration.fast,
  pointerEvents: 'none',
  selectors: {
    '&[data-state="visible"]': {
      opacity: 1,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

/*
 * Caret pointing up at the active trigger. Rendered as an SVG triangle in
 * `NavigationMenuIndicator`. Fill follows `currentColor` (surface) so the
 * wedge reads as part of the panel; a small `drop-shadow` filter lifts it
 * off the page background so it stays visible even when page and panel are
 * both light.
 */
export const navigationMenuIndicatorArrow = style({
  color: vars.color.background.surface,
  display: 'block',
  // Mirrors the panel's elevation onto the wedge — without this the panel
  // gains shadow but the floating caret above it looks like a stray dot.
  filter: 'drop-shadow(0 -1px 0 rgba(0, 0, 0, 0.08)) drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.06))',
});

export const navigationMenuViewport = style([
  _viewportClass,
  {
    position: 'relative',
    width: 'var(--radix-navigation-menu-viewport-width)',
    height: 'var(--radix-navigation-menu-viewport-height)',
    // Mirrors the cap on `navigationMenuContent`: the Viewport mirrors the
    // active Content's measured size, so without this cap a wide mega-menu
    // would still drag the Viewport past the screen edge even though the
    // inner Content was clamped.
    maxWidth: `calc(100vw - 2 * ${vars.space['4']})`,
    // Without this, the Viewport is a flex child of `navigationMenuViewportWrapper`
    // (which is `width: 100%` of the root's `max-content`) and gets shrunk back to
    // the wrapper's width — clipping mega-menus that are wider than the trigger row.
    flexShrink: 0,
    background: vars.color.background.surface,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.lg,
    overflow: 'hidden',
    transitionProperty: 'width, height',
    transitionDuration: vars.duration.fast,
    transformOrigin: 'top center',
    selectors: {
      '[data-cynosure-reduced-motion] &': {
        transitionDuration: '0s',
      },
    },
  },
]);

export const navigationMenuViewportWrapper = style({
  position: 'absolute',
  display: 'flex',
  // Anchored to the start of the trigger row, not centred. The wrapper is
  // `width: 100%` of the Root (which is `width: max-content`), so when the
  // active panel's content is wider than the trigger row (typical mega-menu),
  // `justify-content: center` would push the panel half off the left edge.
  // `flex-start` lets a wide panel extend rightward from the row's leading
  // edge instead.
  justifyContent: 'flex-start',
  width: '100%',
  top: '100%',
  left: 0,
  // Leaves room for the `<NavigationMenuIndicator>` caret to sit between the
  // trigger row and the popup. Without this gap the caret renders inside the
  // panel itself and becomes invisible (white wedge on the white surface).
  marginBlockStart: vars.space['2'],
  perspective: '2000px',
});
