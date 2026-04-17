import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const tabsRoot = style({
  display: 'flex',
  width: '100%',
  selectors: {
    '&[data-orientation="horizontal"]': {
      flexDirection: 'column',
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
  },
});

/** Wrapper around the trigger row. Hosts the animated indicator. */
export const tabsListBase = style({
  position: 'relative',
  display: 'inline-flex',
  gap: vars.space['0.5'],
  color: vars.color.foreground.muted,
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
  padding: vars.space['0.5'],
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
});

export const tabsListSoft = style({
  padding: vars.space['0.5'],
  background: vars.color.background.muted,
  borderRadius: vars.radius.full,
});

export const tabsListSolid = style({});

export const tabsTriggerBase = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['1.5'],
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  fontFamily: 'var(--lumen-font-body-md-family)',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderRadius: vars.radius.sm,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const tabsTriggerSize = styleVariants({
  sm: {
    paddingBlock: vars.space['1'],
    paddingInline: vars.space['2'],
    fontSize: 'var(--lumen-font-body-sm-size)',
  },
  md: {
    paddingBlock: vars.space['1.5'],
    paddingInline: vars.space['3'],
    fontSize: 'var(--lumen-font-body-md-size)',
  },
  lg: {
    paddingBlock: vars.space['2'],
    paddingInline: vars.space['4'],
    fontSize: 'var(--lumen-font-body-lg-size)',
  },
});

/**
 * `line` variant: underline that can be animated by TabsIndicator. The
 * trigger itself shows a subtle colour change when active; TabsIndicator
 * paints the actual underline. When the indicator isn't rendered we fall
 * back to a bottom-border on the trigger itself for correctness.
 */
export const tabsTriggerLine = style({
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      color: vars.color.accent.solid,
    },
  },
});

export const tabsTriggerLineFallback = style({
  selectors: {
    '&[data-state="active"]': {
      boxShadow: `inset 0 -2px 0 0 ${vars.color.accent.solid}`,
    },
    '&[data-orientation="vertical"][data-state="active"]': {
      boxShadow: `inset -2px 0 0 0 ${vars.color.accent.solid}`,
    },
  },
});

export const tabsTriggerSolid = style({
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
  },
});

export const tabsTriggerSoft = style({
  borderRadius: vars.radius.full,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      background: vars.color.background.surface,
      color: vars.color.foreground.default,
      boxShadow: vars.shadow.sm,
    },
  },
});

export const tabsTriggerEnclosed = style({
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.muted,
  selectors: {
    '&:hover': {
      color: vars.color.foreground.default,
    },
    '&[data-state="active"]': {
      background: vars.color.background.surface,
      color: vars.color.foreground.default,
      boxShadow: vars.shadow.xs,
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

/**
 * Animated indicator for `line` variant. Positions itself via CSS custom
 * properties (`--lumen-tabs-indicator-left|top|width|height`) so motion is
 * cheap and GPU-compositable.
 */
export const tabsIndicator = style({
  position: 'absolute',
  background: vars.color.accent.solid,
  pointerEvents: 'none',
  transitionProperty: 'left, top, width, height',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: 'ease-out',
  selectors: {
    '[data-lumen-reduced-motion] &': {
      transitionDuration: '0s',
    },
    '&[data-orientation="horizontal"]': {
      left: 'var(--lumen-tabs-indicator-left, 0)',
      width: 'var(--lumen-tabs-indicator-width, 0)',
      bottom: 0,
      height: '2px',
    },
    '&[data-orientation="vertical"]': {
      top: 'var(--lumen-tabs-indicator-top, 0)',
      height: 'var(--lumen-tabs-indicator-height, 0)',
      right: 0,
      width: '2px',
    },
    '&[data-pending="true"]': {
      opacity: 0,
    },
  },
});

export const tabsContent = style({
  outline: 'none',
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderRadius: vars.radius.sm,
    },
  },
});
