import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const codeBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    fontFamily: vars.font.family.mono,
    borderRadius: vars.radius.sm,
    paddingInline: '0.25em',
    paddingBlock: '0.1em',
    fontVariantLigatures: 'none',
  },
]);

export const codeBlock = style({
  // Drive `display` through the layoutPropsStyle var that `codeBase`
  // (paired with this variant on `<pre><code>`) composes. A literal
  // `display: block` here loses to later layoutPropsStyle emissions in the
  // bundled stylesheet — see `Flex.css.ts` for the full incident note.
  vars: { '--cynosure-lp-d-base': 'block' },
  padding: 'var(--cynosure-space-3)',
  borderRadius: vars.radius.md,
  whiteSpace: 'pre',
  overflowX: 'auto',
  fontFamily: vars.font.family.mono,
});

export const codeSize = styleVariants({
  sm: { fontSize: vars.font.body.xs.size },
  md: { fontSize: vars.font.body.sm.size },
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
