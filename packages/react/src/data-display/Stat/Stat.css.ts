import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const statRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  minWidth: 0,
});

export const statLabel = style({
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 500,
});

export const statValue = style({
  margin: 0,
  fontFamily: vars.font.heading['2'].family,
  fontSize: vars.font.heading['2'].size,
  fontWeight: 700,
  lineHeight: 1.1,
  color: vars.color.foreground.default,
  fontVariantNumeric: 'tabular-nums',
});

export const statHelp = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  margin: 0,
});

export const statArrow = style({
  display: 'inline-flex',
  alignItems: 'center',
  selectors: {
    '&[data-direction="increase"]': { color: vars.color.feedback.success.foreground },
    '&[data-direction="decrease"]': { color: vars.color.feedback.danger.foreground },
  },
});
