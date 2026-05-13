import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/*
 * Menu CSS is intentionally narrow: layout (column flow, label row, group
 * body, divider) comes from Stack / Inline / Divider; the badge slot comes
 * from Badge; group collapse comes from Collapsible. The styles below cover
 * only what's unique to Menu — interactive item chrome and the group label /
 * caret typography.
 */

export const menuItemBase = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['2'],
  background: 'transparent',
  border: 'none',
  color: vars.color.foreground.default,
  textDecoration: 'none',
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 'var(--cynosure-font-body-md-size)',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 500,
  width: '100%',
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadow.focusRing,
    },
    '&[data-active="true"]': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solid,
      fontWeight: 600,
    },
    '&[data-disabled="true"]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const menuItemIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  flex: '0 0 auto',
  color: vars.color.foreground.muted,
  selectors: {
    [`${menuItemBase}[data-active="true"] &`]: {
      color: vars.color.accent.solid,
    },
  },
});

export const menuItemLabel = style({
  flex: '1 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const menuGroupLabel = style({
  flex: '1 1 auto',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const menuGroupToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  background: 'transparent',
  border: 'none',
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['2'],
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  borderRadius: vars.radius.xs,
  width: '100%',
  textAlign: 'left',
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadow.focusRing,
    },
  },
});

export const menuGroupCaret = style({
  display: 'inline-flex',
  alignItems: 'center',
  flex: '0 0 auto',
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    // Driven by Radix Collapsible's `data-state` on the trigger ancestor —
    // open ⇒ chevron points down, closed ⇒ right.
    '[data-state="open"] &': {
      transform: 'rotate(90deg)',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});
