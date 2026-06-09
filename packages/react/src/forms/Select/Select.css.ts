import { style } from '@vanilla-extract/css';

export const itemCheck = style({
  display: 'inline-flex',
  alignItems: 'center',
  color: 'currentColor',
  flexShrink: 0,
  opacity: 0,
  selectors: {
    '[data-selected] &': {
      opacity: 1,
    },
  },
});
