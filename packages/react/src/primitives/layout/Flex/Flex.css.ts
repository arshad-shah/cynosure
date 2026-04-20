import { style } from '@vanilla-extract/css';
import { buildResponsiveRules, layoutPropsStyle } from '../shared/layoutStyle.css.js';

const FLEX_ENTRIES: Array<[string, string]> = [
  ['flex-direction', 'cynosure-flex-dir'],
  ['flex-wrap', 'cynosure-flex-wrap'],
  ['flex-grow', 'cynosure-flex-grow'],
  ['flex-shrink', 'cynosure-flex-shrink'],
  ['flex-basis', 'cynosure-flex-basis'],
  ['gap', 'cynosure-flex-gap'],
  ['row-gap', 'cynosure-flex-row-gap'],
  ['column-gap', 'cynosure-flex-col-gap'],
  ['align-items', 'cynosure-flex-align'],
  ['justify-content', 'cynosure-flex-justify'],
];

const FLEX_RULES = buildResponsiveRules(FLEX_ENTRIES);

export const flex = style([
  layoutPropsStyle,
  {
    display: 'flex',
    // Prevents flex children from overflowing their container on narrow tracks.
    minWidth: 0,
    ...FLEX_RULES.base,
    '@media': FLEX_RULES.media,
  },
]);
