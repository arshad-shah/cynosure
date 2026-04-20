import { style } from '@vanilla-extract/css';
import { buildResponsiveRules, layoutPropsStyle } from '../shared/layoutStyle.css.js';

const INLINE_ENTRIES: Array<[string, string]> = [
  ['gap', 'cynosure-inline-gap'],
  ['column-gap', 'cynosure-inline-col-gap'],
  ['row-gap', 'cynosure-inline-row-gap'],
  ['align-items', 'cynosure-inline-align'],
  ['justify-content', 'cynosure-inline-justify'],
  ['flex-wrap', 'cynosure-inline-wrap'],
];

const INLINE_RULES = buildResponsiveRules(INLINE_ENTRIES);

export const inline = style([
  layoutPropsStyle,
  {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    minWidth: 0,
    ...INLINE_RULES.base,
    '@media': INLINE_RULES.media,
  },
]);
