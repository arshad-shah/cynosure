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

const propsAt = (bps: string[]): Record<string, string> => ({
  fontFamily: cascade('cynosure-heading-family', bps),
  fontSize: cascade('cynosure-heading-size', bps),
  lineHeight: cascade('cynosure-heading-lh', bps),
  letterSpacing: cascade('cynosure-heading-ls', bps),
  fontWeight: cascade('cynosure-heading-weight', bps),
  textAlign: cascade('cynosure-heading-align', bps),
});

export const heading = style([
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
