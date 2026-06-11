import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const notificationRoot = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  columnGap: vars.space['3'],
  rowGap: vars.space['1'],
  alignItems: 'start',
  padding: vars.space['3'],
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  fontFamily: vars.font.body.md.family,
  color: vars.color.foreground.default,
  transitionProperty: 'background-color, border-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-unread="true"]': {
      background: vars.color.accent.soft,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const notificationIcon = style({
  gridColumn: 1,
  gridRow: '1 / span 2',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: vars.radius.full,
  flex: '0 0 auto',
  background: vars.color.background.muted,
  color: vars.color.foreground.default,
});

export const notificationHeader = style({
  gridColumn: 2,
  gridRow: 1,
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  minWidth: 0,
});

export const notificationTitle = style({
  margin: 0,
  fontSize: vars.font.body.md.size,
  fontWeight: vars.font.weight.semibold,
  lineHeight: vars.font.body.md.lineHeight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const notificationTimestamp = style({
  fontSize: vars.font.body.xs.size,
  color: vars.color.foreground.muted,
  flex: '0 0 auto',
  fontVariantNumeric: 'tabular-nums',
});

export const notificationDescription = style({
  gridColumn: 2,
  gridRow: 2,
  margin: 0,
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  lineHeight: vars.font.body.sm.lineHeight,
});

export const notificationActions = style({
  gridColumn: 2,
  gridRow: 3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  marginTop: vars.space['1'],
});

export const notificationDismiss = style({
  gridColumn: 3,
  gridRow: '1 / span 2',
  justifySelf: 'end',
});

export const notificationUnreadDot = style({
  position: 'absolute',
  top: vars.space['2'],
  right: vars.space['2'],
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: vars.radius.full,
  background: vars.color.accent.solid,
  pointerEvents: 'none',
});
