import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'inline-flex',
  gap: vars.space['2'],
});

export const cell = style({
  width: '2.5rem',
  height: '2.5rem',
  textAlign: 'center',
  fontSize: 'var(--lumen-font-body-lg-size)',
  fontVariantNumeric: 'tabular-nums',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  outline: 'none',
  padding: 0,
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:focus': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-filled="true"]': {
      borderColor: vars.color.accent.solid,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const cellSize = styleVariants({
  sm: { width: '2rem', height: '2rem', fontSize: 'var(--lumen-font-body-md-size)' },
  md: { width: '2.5rem', height: '2.5rem', fontSize: 'var(--lumen-font-body-lg-size)' },
  lg: { width: '3rem', height: '3rem', fontSize: 'var(--lumen-font-body-lg-size)' },
});
