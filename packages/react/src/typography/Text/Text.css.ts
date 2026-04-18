import { style } from '@vanilla-extract/css';
import { MEDIA_QUERIES } from '../../primitives/layout/shared/breakpoints.js';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { typographyBase } from '../shared/shared.css.js';

const cascade = (base: string, bps: string[]): string => {
  let expr = `var(--${base}-base)`;
  for (const bp of bps) {
    if (bp === 'base') continue;
    expr = `var(--${base}-${bp}, ${expr})`;
  }
  return expr;
};

/**
 * Text reads one size/weight/align custom property per breakpoint. The
 * cascade chain means unset breakpoints inherit from the nearest lower one,
 * so the component never has to know which breakpoints the caller set.
 */
const propsAt = (bps: string[]): Record<string, string> => ({
  fontSize: cascade('cynosure-text-size', bps),
  fontFamily: cascade('cynosure-text-family', bps),
  lineHeight: cascade('cynosure-text-lh', bps),
  letterSpacing: cascade('cynosure-text-ls', bps),
  fontWeight: cascade('cynosure-text-weight', bps),
  textAlign: cascade('cynosure-text-align', bps),
});

export const text = style([
  layoutPropsStyle,
  typographyBase,
  {
    ...propsAt(['base']),
    '@media': {
      [MEDIA_QUERIES.sm]: propsAt(['base', 'sm']),
      [MEDIA_QUERIES.md]: propsAt(['base', 'sm', 'md']),
      [MEDIA_QUERIES.lg]: propsAt(['base', 'sm', 'md', 'lg']),
      [MEDIA_QUERIES.xl]: propsAt(['base', 'sm', 'md', 'lg', 'xl']),
      [MEDIA_QUERIES['2xl']]: propsAt(['base', 'sm', 'md', 'lg', 'xl', '2xl']),
    },
  },
]);
