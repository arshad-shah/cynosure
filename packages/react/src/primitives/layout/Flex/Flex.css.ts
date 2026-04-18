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
  'flex-direction': cascade('cynosure-flex-dir', bps),
  'flex-wrap': cascade('cynosure-flex-wrap', bps),
  'flex-grow': cascade('cynosure-flex-grow', bps),
  'flex-shrink': cascade('cynosure-flex-shrink', bps),
  'flex-basis': cascade('cynosure-flex-basis', bps),
  gap: cascade('cynosure-flex-gap', bps),
  'row-gap': cascade('cynosure-flex-row-gap', bps),
  'column-gap': cascade('cynosure-flex-col-gap', bps),
  'align-items': cascade('cynosure-flex-align', bps),
  'justify-content': cascade('cynosure-flex-justify', bps),
});

export const flex = style([
  layoutPropsStyle,
  {
    display: 'flex',
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
