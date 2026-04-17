import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const errorText = style({
  margin: 0,
  color: vars.color.feedback.danger.foreground,
  fontSize: 'var(--lumen-font-body-xs-size)',
  lineHeight: 'var(--lumen-font-body-xs-line-height)',
  fontWeight: 'var(--lumen-font-weight-medium)',
});
