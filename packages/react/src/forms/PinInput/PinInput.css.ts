import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'inline-flex',
  gap: vars.space['2'],
});

export const cell = style({
  width: '2.75rem',
  height: '2.75rem',
  textAlign: 'center',
  fontSize: 'var(--lumen-font-body-lg-size)',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  border: `1.5px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  outline: 'none',
  padding: 0,
  cursor: 'text',
  caretColor: vars.color.accent.solid,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not(:disabled):not(:focus)': {
      borderColor: vars.color.accent.solid,
    },
    '&:focus': {
      borderColor: vars.color.accent.solid,
      boxShadow: `0 0 0 3px ${vars.color.accent.ring}`,
    },
    '&[data-filled="true"]': {
      borderColor: vars.color.accent.solid,
      background: vars.color.accent.soft,
      color: vars.color.accent.foreground,
    },
    '&[data-filled="true"]:focus': {
      background: vars.color.background.surface,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"]:focus': {
      boxShadow: `0 0 0 3px ${vars.color.feedback.danger.soft}`,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const cellSize = styleVariants({
  sm: { width: '2.25rem', height: '2.25rem', fontSize: 'var(--lumen-font-body-md-size)' },
  md: { width: '2.75rem', height: '2.75rem', fontSize: 'var(--lumen-font-body-lg-size)' },
  lg: { width: '3.25rem', height: '3.25rem', fontSize: 'var(--lumen-font-heading-xs-size)' },
});
