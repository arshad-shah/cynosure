import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const errorText = style({
  margin: 0,
  color: vars.color.feedback.danger.foreground,
  fontSize: 'var(--cynosure-font-body-xs-size)',
  lineHeight: 'var(--cynosure-font-body-xs-line-height)',
  fontWeight: 'var(--cynosure-font-weight-medium)',
});
