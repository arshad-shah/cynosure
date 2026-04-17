import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const fieldGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  width: '100%',
});

export const dateSegments = style({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  paddingInline: 0,
  minHeight: '1.5rem',
  color: 'inherit',
  font: 'inherit',
});

export const segment = style({
  display: 'inline-block',
  paddingInline: '1px',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  outline: 'none',
  borderRadius: vars.radius.xs,
  selectors: {
    '&[data-placeholder]': {
      color: vars.color.foreground.subtle,
    },
    '&[data-focused]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-disabled]': {
      color: vars.color.foreground.disabled,
    },
  },
});

export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space['1'],
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.muted,
  outline: 'none',
  selectors: {
    '&:hover:not(:disabled)': {
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderRadius: vars.radius.sm,
    },
  },
});

export const calendarWrap = style({
  padding: vars.space['3'],
  minWidth: '18rem',
});

export const calendarHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space['2'],
  gap: vars.space['2'],
});

export const calendarNavButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.muted,
  borderRadius: vars.radius.sm,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.background.subtle,
      color: vars.color.foreground.default,
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
  fontSize: 'var(--lumen-font-body-md-size)',
});

export const calendarGrid = style({
  borderCollapse: 'collapse',
  width: '100%',
});

export const calendarGridHeaderCell = style({
  padding: vars.space['1'],
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontWeight: 500,
  color: vars.color.foreground.muted,
  textAlign: 'center',
});

export const calendarCell = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontVariantNumeric: 'tabular-nums',
  borderRadius: vars.radius.sm,
  outline: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.default,
  selectors: {
    '&[data-outside-month]': {
      color: vars.color.foreground.subtle,
    },
    '&[data-hovered]:not([data-disabled])': {
      background: vars.color.background.subtle,
    },
    '&[data-focused]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-selected]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
    '&[data-selection-start], &[data-selection-end]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
    '&[data-selected]:not([data-selection-start]):not([data-selection-end])': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
      borderRadius: 0,
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

export const rangeSeparator = style({
  marginInline: vars.space['1'],
  color: vars.color.foreground.muted,
});
