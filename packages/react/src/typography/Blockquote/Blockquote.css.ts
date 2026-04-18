import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const blockquoteBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    fontFamily: 'var(--cynosure-font-family-serif)',
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
    color: vars.color.foreground.default,
  },
]);

export const blockquoteVariant = styleVariants({
  default: {
    borderInlineStartWidth: '3px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: vars.color.border.strong,
    paddingInlineStart: vars.space[4],
    paddingBlock: vars.space[2],
  },
  callout: {
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.accent.soft,
    borderInlineStartWidth: '4px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: vars.color.accent.solid,
    padding: vars.space[4],
    color: vars.color.foreground.default,
  },
});

export const blockquoteAttribution = style({
  display: 'block',
  marginBlockStart: vars.space[2],
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontStyle: 'normal',
  color: vars.color.foreground.muted,
  selectors: {
    '&::before': { content: '"— "' },
  },
});
