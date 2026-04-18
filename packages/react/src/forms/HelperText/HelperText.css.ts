import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const helperText = style({
  margin: 0,
  color: vars.color.foreground.muted,
  fontSize: 'var(--cynosure-font-body-xs-size)',
  lineHeight: 'var(--cynosure-font-body-xs-line-height)',
});
