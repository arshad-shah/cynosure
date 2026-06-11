import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const errorText = style({
  margin: 0,
  color: vars.color.feedback.danger.foreground,
  fontSize: vars.font.body.xs.size,
  lineHeight: vars.font.body.xs.lineHeight,
  fontWeight: vars.font.weight.medium,
});
