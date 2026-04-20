import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

export const kbdBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--cynosure-font-family-mono)',
    fontWeight: 'var(--cynosure-font-weight-medium)',
    lineHeight: 1,
    color: vars.color.foreground.default,
    backgroundColor: vars.color.background.subtle,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: vars.radius.sm,
    // Subtle bottom highlight so it reads as a keycap.
    boxShadow: `inset 0 -1px 0 0 ${vars.color.border.strong}`,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    verticalAlign: 'baseline',
  },
]);

/**
 * Icon rendered inside a keycap (for known keyboard glyphs). Dropped to
 * baseline of the surrounding text so the keycap stays centered on the text
 * line rather than growing the row height.
 */
export const kbdIcon = style({
  display: 'inline-block',
  verticalAlign: 'middle',
});

export const kbdSize = styleVariants({
  sm: {
    fontSize: 'var(--cynosure-font-body-xs-size)',
    paddingInline: '0.35em',
    paddingBlock: '0.1em',
    minWidth: '1.5em',
    minHeight: '1.5em',
  },
  md: {
    fontSize: 'var(--cynosure-font-body-sm-size)',
    paddingInline: '0.45em',
    paddingBlock: '0.15em',
    minWidth: '1.75em',
    minHeight: '1.75em',
  },
  lg: {
    fontSize: 'var(--cynosure-font-body-md-size)',
    paddingInline: '0.55em',
    paddingBlock: '0.2em',
    minWidth: '2em',
    minHeight: '2em',
  },
});
