import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const blockquoteBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    // Force block display through the layout-prop var. Without this, the
    // duplicated `layoutPropsStyle` emission later in the bundle leaves
    // `--cynosure-lp-d-base` unset → invalid-at-computed-value-time → reverts
    // to `inline`, which collapses the start-border onto the first wrapped
    // line only (same workaround as `blockquoteAttribution`).
    vars: { '--cynosure-lp-d-base': 'block' },
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
  // Applied alongside Box's layoutPropsStyle on a `<cite>`, so drive
  // `display` through the var (see `Flex.css.ts`) to survive duplicated
  // layoutPropsStyle emissions later in the bundle.
  vars: { '--cynosure-lp-d-base': 'block' },
  marginBlockStart: vars.space[2],
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontStyle: 'normal',
  color: vars.color.foreground.muted,
  selectors: {
    '&::before': { content: '"— "' },
  },
});
