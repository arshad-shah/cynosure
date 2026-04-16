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
  gap: cascade('lumen-inline-gap', bps),
  'column-gap': cascade('lumen-inline-col-gap', bps),
  'row-gap': cascade('lumen-inline-row-gap', bps),
  'align-items': cascade('lumen-inline-align', bps),
  'justify-content': cascade('lumen-inline-justify', bps),
  'flex-wrap': cascade('lumen-inline-wrap', bps),
});

export const inline = style([
  layoutPropsStyle,
  {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
