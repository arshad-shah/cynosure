import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const collapsibleRoot = style({
  width: '100%',
});

export const collapsibleContent = style({
  overflow: 'hidden',
  transition: `height ${vars.duration.normal} ease`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
