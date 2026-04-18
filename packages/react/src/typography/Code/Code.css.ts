import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const codeBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    fontFamily: 'var(--cynosure-font-family-mono)',
    borderRadius: vars.radius.sm,
    paddingInline: '0.25em',
    paddingBlock: '0.1em',
    fontVariantLigatures: 'none',
  },
]);

export const codeBlock = style({
  display: 'block',
  padding: 'var(--cynosure-space-3)',
  borderRadius: vars.radius.md,
  whiteSpace: 'pre',
  overflowX: 'auto',
  fontFamily: 'var(--cynosure-font-family-mono)',
});

export const codeSize = styleVariants({
  sm: { fontSize: 'var(--cynosure-font-body-xs-size)' },
  md: { fontSize: 'var(--cynosure-font-body-sm-size)' },
});

export const codeColorScheme = styleVariants({
  neutral: {
    backgroundColor: vars.color.background.subtle,
    color: vars.color.foreground.default,
  },
  accent: {
    backgroundColor: vars.color.accent.soft,
    color: vars.color.accent.solid,
  },
  success: {
    backgroundColor: vars.color.feedback.success.soft,
    color: vars.color.feedback.success.foreground,
  },
  danger: {
    backgroundColor: vars.color.feedback.danger.soft,
    color: vars.color.feedback.danger.foreground,
  },
});
