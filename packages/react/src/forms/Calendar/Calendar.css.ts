import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const calendarHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space['3']} ${vars.space['4']} ${vars.space['2']}`,
  gap: vars.space['2'],
});

export const calendarNavButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.muted,
  borderRadius: vars.radius.sm,
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

export const calendarTitle = style({
  fontWeight: 600,
  fontSize: 'var(--cynosure-font-body-md-size)',
  color: vars.color.foreground.default,
  letterSpacing: '-0.01em',
});

export const calendarGrid = style({
  borderCollapse: 'separate',
  borderSpacing: '3px',
  width: '100%',
  padding: `0 ${vars.space['3']} ${vars.space['3']}`,
});

export const calendarGridHeaderCell = style({
  padding: vars.space['1'],
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: vars.color.foreground.subtle,
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});

export const calendarCell = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 500,
  borderRadius: vars.radius.sm,
  outline: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.default,
  position: 'relative',
  transitionProperty: 'background-color, color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-outside-month]': {
      color: vars.color.foreground.subtle,
      opacity: 0.45,
    },
    '&[data-hovered]:not([data-disabled]):not([data-selected])': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&[data-focused]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-today]:not([data-selected])': {
      color: vars.color.accent.solid,
      fontWeight: 700,
    },
    '&[data-today]:not([data-selected])::after': {
      content: '""',
      position: 'absolute',
      bottom: '4px',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: vars.color.accent.solid,
    },
    '&[data-selected]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      fontWeight: 600,
    },
    '&[data-selection-start], &[data-selection-end]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
    '&[data-selected]:not([data-selection-start]):not([data-selection-end])': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
      borderRadius: 0,
      fontWeight: 500,
    },
    '&[data-disabled]': {
      color: vars.color.foreground.disabled,
      cursor: 'not-allowed',
    },
    '&[data-unavailable]': {
      textDecoration: 'line-through',
      color: vars.color.foreground.subtle,
      cursor: 'not-allowed',
    },
  },
});
