import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const linkBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    display: 'inline',
    cursor: 'pointer',
    color: vars.color.accent.solid,
    textDecorationLine: 'none',
    textUnderlineOffset: '0.15em',
    selectors: {
      '&:hover': { color: vars.color.accent.solidHover },
      '&:active': { color: vars.color.accent.solidActive },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: vars.shadow.focusRing,
        borderRadius: vars.radius.xs,
      },
    },
  },
]);

export const linkVariant = styleVariants({
  default: {},
  subtle: {
    color: vars.color.foreground.default,
    selectors: {
      '&:hover': { color: vars.color.accent.solid },
      '&:active': { color: vars.color.accent.solidActive },
    },
  },
  emphasis: {
    color: vars.color.accent.solid,
    fontWeight: 'var(--lumen-font-weight-semibold)',
  },
});

export const linkUnderline = styleVariants({
  always: { textDecorationLine: 'underline' },
  hover: {
    textDecorationLine: 'none',
    selectors: { '&:hover': { textDecorationLine: 'underline' } },
  },
  none: { textDecorationLine: 'none' },
});

export const linkDisabled = style({
  pointerEvents: 'none',
  cursor: 'not-allowed',
  opacity: 0.6,
  color: vars.color.foreground.disabled,
});

export const externalIcon = style({
  display: 'inline-block',
  width: '0.75em',
  height: '0.75em',
  marginInlineStart: '0.25em',
  verticalAlign: 'baseline',
  flexShrink: 0,
});
