import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const formField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1.5'],
});
