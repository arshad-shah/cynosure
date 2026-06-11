import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const fieldset = style({
  margin: 0,
  padding: vars.space['4'],
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  selectors: {
    '&[data-disabled="true"]': {
      opacity: 0.6,
    },
  },
});

export const legend = style({
  paddingInline: vars.space['1'],
  fontSize: vars.font.body.sm.size,
  lineHeight: vars.font.body.sm.lineHeight,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.foreground.default,
});
