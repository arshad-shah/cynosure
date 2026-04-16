import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/vars.css.js';

export const dividerBase = style({
  border: 0,
  margin: 0,
  padding: 0,
  background: 'currentColor',
  color: vars.color.border.default,
  // Self-stretch inside a flex container if orientation matches.
  alignSelf: 'stretch',
});

export const dividerHorizontal = style({
  width: '100%',
  height: 'var(--lumen-divider-thickness, 1px)',
});

export const dividerVertical = style({
  width: 'var(--lumen-divider-thickness, 1px)',
  height: 'auto',
  minHeight: '1em',
});

export const dividerSolid = style({ borderStyle: 'solid' });
export const dividerDashed = style({
  background: 'transparent',
  borderTopWidth: 'var(--lumen-divider-thickness, 1px)',
  borderTopStyle: 'dashed',
  borderTopColor: 'currentColor',
  height: 0,
});
export const dividerDotted = style({
  background: 'transparent',
  borderTopWidth: 'var(--lumen-divider-thickness, 1px)',
  borderTopStyle: 'dotted',
  borderTopColor: 'currentColor',
  height: 0,
});
export const dividerVerticalDashed = style({
  background: 'transparent',
  borderLeftWidth: 'var(--lumen-divider-thickness, 1px)',
  borderLeftStyle: 'dashed',
  borderLeftColor: 'currentColor',
  width: 0,
});
export const dividerVerticalDotted = style({
  background: 'transparent',
  borderLeftWidth: 'var(--lumen-divider-thickness, 1px)',
  borderLeftStyle: 'dotted',
  borderLeftColor: 'currentColor',
  width: 0,
});
