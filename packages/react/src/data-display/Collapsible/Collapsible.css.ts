import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-collapsible-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-collapsible-content-height)' },
  to: { height: 0 },
});

export const collapsibleRoot = style({
  width: '100%',
});

export const collapsibleContent = style({
  overflow: 'hidden',
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideDown} ${vars.duration.normal} ${vars.easing.easeInOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${slideUp} ${vars.duration.normal} ${vars.easing.easeInOut}`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&[data-state="open"], &[data-state="closed"]': {
          animation: 'none',
        },
      },
    },
  },
});
