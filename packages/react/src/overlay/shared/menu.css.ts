import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const menuIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-2px) scale(0.98)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const menuOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(-2px) scale(0.98)' },
});

/** Shared content shell — DropdownMenu, ContextMenu, MenuBar, sub-menus. */
export const menuContent = style({
  minWidth: '10rem',
  maxHeight: 'min(60vh, 20rem)',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  overflow: 'auto',
  padding: vars.space['1'],
  zIndex: Number(vars.z.dropdown),
  outline: 'none',
  selectors: {
    '&[data-state="open"]': {
      animation: `${menuIn} ${vars.duration.fast} ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${menuOut} ${vars.duration.fast} ease-in`,
    },
  },
});

/** One item — MenuItem, CheckboxItem, RadioItem, SubTrigger. */
export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  position: 'relative',
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['2'],
  paddingLeft: vars.space['6'],
  borderRadius: vars.radius.sm,
  cursor: 'default',
  userSelect: 'none',
  color: vars.color.foreground.default,
  outline: 'none',
  fontSize: 'var(--lumen-font-body-md-size)',
  lineHeight: 'var(--lumen-font-body-md-line-height)',
  selectors: {
    '&[data-highlighted]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

/** Left-side check indicator for CheckboxItem / RadioItem. */
export const menuIndicator = style({
  position: 'absolute',
  left: vars.space['2'],
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/** Chevron at the right edge of SubTrigger. */
export const menuSubChevron = style({
  marginLeft: 'auto',
  display: 'inline-flex',
});

/** Horizontal rule separator. */
export const menuSeparator = style({
  height: '1px',
  background: vars.color.border.subtle,
  marginBlock: vars.space['1'],
  marginInline: vars.space['1'],
});

/** Section label (non-interactive). */
export const menuLabel = style({
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
  paddingLeft: vars.space['6'],
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

/** Keyboard shortcut chip rendered at the right of an item. */
export const menuShortcut = style({
  marginLeft: 'auto',
  paddingLeft: vars.space['4'],
  fontSize: 'var(--lumen-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

/**
 * Top-level container for `MenuBar`. Horizontal row of triggers styled to
 * match native app menubars.
 */
export const menubarRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['0.5'],
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: vars.space['0.5'],
});

export const menubarTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['2'],
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontFamily: 'var(--lumen-font-body-md-family)',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  selectors: {
    '&[data-highlighted], &[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
