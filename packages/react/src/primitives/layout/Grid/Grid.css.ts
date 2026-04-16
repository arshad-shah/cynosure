import { style } from '@vanilla-extract/css';
import { MEDIA_QUERIES } from '../shared/breakpoints.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const cascade = (base: string, bps: string[]): string => {
  let expr = `var(--${base}-base)`;
  for (const bp of bps) {
    if (bp === 'base') continue;
    expr = `var(--${base}-${bp}, ${expr})`;
  }
  return expr;
};

const propsAt = (bps: string[]): Record<string, string> => ({
  'grid-template-columns': cascade('lumen-grid-cols', bps),
  'grid-template-rows': cascade('lumen-grid-rows', bps),
  gap: cascade('lumen-grid-gap', bps),
  'column-gap': cascade('lumen-grid-col-gap', bps),
  'row-gap': cascade('lumen-grid-row-gap', bps),
  'align-items': cascade('lumen-grid-align', bps),
  'justify-items': cascade('lumen-grid-justify', bps),
});

export const grid = style([
  layoutPropsStyle,
  {
    display: 'grid',
    minWidth: 0,
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
