import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const chipRoot = style({
  appearance: 'none',
  margin: 0,
  font: 'inherit',
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[aria-pressed="true"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[aria-disabled="true"], &:disabled': {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
