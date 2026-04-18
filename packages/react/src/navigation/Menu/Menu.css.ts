import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const menuRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const menuGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const menuGroupLabelRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
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
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  padding: vars.space['0.5'],
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  borderRadius: vars.radius.xs,
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const menuGroupCaret = style({
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-open="true"]': {
      transform: 'rotate(90deg)',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const menuGroupBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  selectors: {
    '&[data-open="false"]': {
      display: 'none',
    },
  },
});

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
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
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

export const menuItemBadge = style({
  flex: '0 0 auto',
  fontSize: 'var(--cynosure-font-body-xs-size, 0.75rem)',
  color: vars.color.foreground.muted,
});

export const menuDividerStyle = style({
  border: 'none',
  height: '1px',
  margin: 0,
  marginBlock: vars.space['1'],
  background: vars.color.border.subtle,
});
