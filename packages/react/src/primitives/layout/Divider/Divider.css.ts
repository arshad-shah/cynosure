import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/vars.css.js';

export const dividerBase = style({
  margin: 0,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: vars.color.border.default,
  flexShrink: 0,
});

export const dividerHorizontal = style({
  display: 'block',
  width: '100%',
  height: 0,
  borderTopStyle: 'solid',
  borderTopColor: 'currentColor',
  borderTopWidth: 'var(--cynosure-divider-thickness, 1px)',
});

export const dividerVertical = style({
  display: 'inline-block',
  width: 0,
  height: 'var(--cynosure-divider-length, auto)',
  minHeight: '1.5em',
  alignSelf: 'stretch',
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: 'currentColor',
  borderInlineStartWidth: 'var(--cynosure-divider-thickness, 1px)',
  verticalAlign: 'middle',
});

export const dividerSolid = style({});
export const dividerDashed = style({
  selectors: {
    [`${dividerHorizontal}&`]: { borderTopStyle: 'dashed' },
    [`${dividerVertical}&`]: { borderInlineStartStyle: 'dashed' },
  },
});
export const dividerDotted = style({
  selectors: {
    [`${dividerHorizontal}&`]: { borderTopStyle: 'dotted' },
    [`${dividerVertical}&`]: { borderInlineStartStyle: 'dotted' },
  },
});
