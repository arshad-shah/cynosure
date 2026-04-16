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
    fontFamily: 'var(--lumen-font-family-mono)',
    fontWeight: 'var(--lumen-font-weight-medium)',
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

export const kbdSize = styleVariants({
  sm: {
    fontSize: 'var(--lumen-font-body-xs-size)',
    paddingInline: '0.35em',
    paddingBlock: '0.1em',
    minWidth: '1.5em',
    minHeight: '1.5em',
  },
  md: {
    fontSize: 'var(--lumen-font-body-sm-size)',
    paddingInline: '0.45em',
    paddingBlock: '0.15em',
    minWidth: '1.75em',
    minHeight: '1.75em',
  },
  lg: {
    fontSize: 'var(--lumen-font-body-md-size)',
    paddingInline: '0.55em',
    paddingBlock: '0.2em',
    minWidth: '2em',
    minHeight: '2em',
  },
});
