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

const listPropsAt = (bps: string[]): Record<string, string> => ({
  rowGap: cascade('cynosure-list-spacing', bps),
  listStyleType: cascade('cynosure-list-marker', bps),
});

/**
 * Shared base for `<ul>` / `<ol>`. `display: flex` + `flex-direction: column`
 * gives us `gap` control without the historical padding/margin quirks of raw
 * list styling.
 */
export const listBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    display: 'flex',
    flexDirection: 'column',
    paddingInlineStart: '1.25em',
    margin: 0,
    ...listPropsAt(['base']),
    '@media': {
      [MEDIA_QUERIES.sm]: listPropsAt(['base', 'sm']),
      [MEDIA_QUERIES.md]: listPropsAt(['base', 'sm', 'md']),
      [MEDIA_QUERIES.lg]: listPropsAt(['base', 'sm', 'md', 'lg']),
      [MEDIA_QUERIES.xl]: listPropsAt(['base', 'sm', 'md', 'lg', 'xl']),
      [MEDIA_QUERIES['2xl']]: listPropsAt(['base', 'sm', 'md', 'lg', 'xl', '2xl']),
    },
    selectors: {
      '&[data-marker-hidden="true"]': { listStyleType: 'none', paddingInlineStart: 0 },
      '&::marker': { color: 'var(--cynosure-list-marker-color, currentColor)' },
    },
  },
]);

export const listItemBase = style({
  // Make sure markers don't get pushed out of the row gap.
  margin: 0,
  selectors: {
    '&::marker': { color: 'var(--cynosure-list-marker-color, currentColor)' },
  },
});

/**
 * Description lists get a two-column auto/auto grid so term + details stay
 * aligned. `dt` goes in column 1, `dd` goes in column 2; consumers can
 * override with `gridColumn` on an item if they want spanning layouts.
 */
export const descriptionListBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    rowGap: 'var(--cynosure-list-spacing-base)',
    columnGap: 'var(--cynosure-space-4)',
    margin: 0,
    '@media': {
      [MEDIA_QUERIES.sm]: {
        rowGap: cascade('cynosure-list-spacing', ['base', 'sm']),
      },
      [MEDIA_QUERIES.md]: {
        rowGap: cascade('cynosure-list-spacing', ['base', 'sm', 'md']),
      },
      [MEDIA_QUERIES.lg]: {
        rowGap: cascade('cynosure-list-spacing', ['base', 'sm', 'md', 'lg']),
      },
      [MEDIA_QUERIES.xl]: {
        rowGap: cascade('cynosure-list-spacing', ['base', 'sm', 'md', 'lg', 'xl']),
      },
      [MEDIA_QUERIES['2xl']]: {
        rowGap: cascade('cynosure-list-spacing', ['base', 'sm', 'md', 'lg', 'xl', '2xl']),
      },
    },
  },
]);

export const descriptionTerm = style({
  margin: 0,
  fontWeight: 'var(--cynosure-font-weight-semibold)',
});

export const descriptionDetails = style({
  margin: 0,
});
