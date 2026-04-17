import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  outline: 'none',
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderRadius: vars.radius.sm,
    },
  },
});

export const star = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: vars.color.border.strong,
  selectors: {
    '&[data-filled="true"]': {
      color: vars.color.feedback.warning.solid,
    },
    '&[data-readonly="true"]': {
      cursor: 'default',
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const starSize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.25rem', height: '1.25rem' },
  lg: { width: '1.5rem', height: '1.5rem' },
});

export const halfOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: '50%',
  color: vars.color.feedback.warning.solid,
});
