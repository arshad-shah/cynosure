import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/*
 * Modern tabs styling, leaning on the pattern shared by Linear / Vercel /
 * shadcn: a single animated indicator that slides between the active
 * triggers, and triggers that just colour their own text. Each variant
 * (`line`, `solid`, `enclosed`, `soft`) repaints the indicator into a
 * different shape (underline, filled pill, surface chip with shadow,
 * rounded pill with shadow). Hover-state always tints — no more "bland"
 * static buttons.
 */

export const tabsRoot = style({
  display: 'flex',
  width: '100%',
  selectors: {
    '&[data-orientation="horizontal"]': {
      flexDirection: 'column',
      gap: vars.space['4'],
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: vars.space['4'],
    },
  },
});

/** Wrapper around the trigger row. Hosts the animated indicator. */
export const tabsListBase = style({
  position: 'relative',
  display: 'inline-flex',
  gap: vars.space['0.5'],
  color: vars.color.foreground.muted,
  // Each trigger is also positioned so its text can layer above the indicator.
  isolation: 'isolate',
  selectors: {
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
});

export const tabsListFullWidth = style({
  display: 'flex',
  width: '100%',
});

globalStyle(`${tabsListFullWidth}[data-orientation="horizontal"] > [role="tab"]`, {
  flex: '1 1 0',
});

export const tabsListLine = style({
  selectors: {
    '&[data-orientation="horizontal"]': {
      borderBottom: `1px solid ${vars.color.border.subtle}`,
    },
    '&[data-orientation="vertical"]': {
      borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
    },
  },
});

export const tabsListEnclosed = style({
  padding: vars.space['1'],
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
});

export const tabsListSoft = style({
  padding: vars.space['1'],
  background: vars.color.background.muted,
  borderRadius: vars.radius.full,
});

export const tabsListSolid = style({});

export const tabsTriggerBase = style({
  // Layered above the indicator so its text stays crisp over the sliding
  // background.
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Built-in gap so icon + label spacing doesn't need consumer-side
  // `marginLeft` hacks.
  gap: vars.space['1.5'],
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadow.focusRing,
      borderRadius: vars.radius.sm,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const tabsTriggerSize = styleVariants({
  sm: {
    paddingBlock: vars.space['1'],
    paddingInline: vars.space['2'],
    fontSize: 'var(--cynosure-font-body-sm-size)',
    minHeight: '1.75rem',
  },
  md: {
    paddingBlock: vars.space['1.5'],
    paddingInline: vars.space['3'],
    fontSize: 'var(--cynosure-font-body-md-size)',
    minHeight: '2.25rem',
  },
  lg: {
    paddingBlock: vars.space['2'],
    paddingInline: vars.space['4'],
    fontSize: 'var(--cynosure-font-body-lg-size)',
    minHeight: '2.75rem',
  },
});

/*
 * Trigger colours — only the text colour changes per state; the active
 * "background" comes from the sliding indicator below, so all variants
 * share the same smooth motion.
 */
export const tabsTriggerLine = style({
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover:not([data-state="active"])': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      color: vars.color.accent.solid,
    },
  },
});

export const tabsTriggerSolid = style({
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover:not([data-state="active"])': {
      color: vars.color.foreground.default,
      background: vars.color.accent.soft,
    },
    '&[data-state="active"]': {
      color: vars.color.accent.onSolid,
    },
  },
});

export const tabsTriggerSoft = style({
  borderRadius: vars.radius.full,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover:not([data-state="active"])': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      color: vars.color.foreground.default,
    },
  },
});

export const tabsTriggerEnclosed = style({
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover:not([data-state="active"])': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      color: vars.color.foreground.default,
    },
  },
});

export const tabsTriggerNeutral = style({
  selectors: {
    '&[data-state="active"]': {
      color: vars.color.foreground.default,
    },
  },
});

/*
 * Animated indicator — a single absolute element that slides under the
 * active trigger. Visual shape varies per variant via `data-cynosure-variant`
 * so the same DOM node can render as an underline, a filled pill, or a
 * surface chip with shadow.
 */
export const tabsIndicator = style({
  position: 'absolute',
  pointerEvents: 'none',
  transitionProperty: 'transform, width, height, opacity, background-color',
  transitionDuration: vars.duration.normal,
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Default geometry — overridden per variant below.
  width: 'var(--cynosure-tabs-indicator-width, 0)',
  height: 'var(--cynosure-tabs-indicator-height, 0)',
  transform:
    'translate(var(--cynosure-tabs-indicator-left, 0), var(--cynosure-tabs-indicator-top, 0))',
  top: 0,
  left: 0,
  // Painted below trigger text.
  zIndex: 0,
  selectors: {
    '&[data-pending="true"]': {
      opacity: 0,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
    // ── Line variant ───────────────────────────────────────────────────
    '&[data-cynosure-variant="line"][data-orientation="horizontal"]': {
      // 2px underline pinned to the bottom of the trigger.
      height: '2px',
      // Re-derive transform: x already from var; pin Y to the trigger's
      // bottom edge.
      transform:
        'translate(var(--cynosure-tabs-indicator-left, 0), calc(var(--cynosure-tabs-indicator-top, 0) + var(--cynosure-tabs-indicator-height, 0) - 2px))',
      background: vars.color.accent.solid,
    },
    '&[data-cynosure-variant="line"][data-orientation="vertical"]': {
      // 2px right-edge rule in vertical mode.
      width: '2px',
      transform:
        'translate(calc(var(--cynosure-tabs-indicator-left, 0) + var(--cynosure-tabs-indicator-width, 0) - 2px), var(--cynosure-tabs-indicator-top, 0))',
      background: vars.color.accent.solid,
    },
    // ── Solid variant ─────────────────────────────────────────────────
    '&[data-cynosure-variant="solid"]': {
      background: vars.color.accent.solid,
      borderRadius: vars.radius.sm,
    },
    // ── Enclosed variant ───────────────────────────────────────────────
    '&[data-cynosure-variant="enclosed"]': {
      background: vars.color.background.surface,
      borderRadius: vars.radius.sm,
      boxShadow: vars.shadow.xs,
    },
    // ── Soft variant ───────────────────────────────────────────────────
    '&[data-cynosure-variant="soft"]': {
      background: vars.color.background.surface,
      borderRadius: vars.radius.full,
      boxShadow: vars.shadow.sm,
    },
  },
});

export const tabsContent = style({
  outline: 'none',
  selectors: {
    '&:focus-visible': {
      boxShadow: vars.shadow.focusRing,
      borderRadius: vars.radius.sm,
    },
  },
});
