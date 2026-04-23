import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const GRID_ENTRIES: Array<[string, string]> = [
  ['grid-template-columns', 'cynosure-grid-cols'],
  ['grid-template-rows', 'cynosure-grid-rows'],
  ['grid-auto-flow', 'cynosure-grid-flow'],
  ['grid-auto-columns', 'cynosure-grid-auto-cols'],
  ['grid-auto-rows', 'cynosure-grid-auto-rows'],
  ['gap', 'cynosure-grid-gap'],
  ['column-gap', 'cynosure-grid-col-gap'],
  ['row-gap', 'cynosure-grid-row-gap'],
  // `align` → align-items (item within cell); `alignContent` → align-content (tracks within container).
  ['align-items', 'cynosure-grid-align'],
  ['align-content', 'cynosure-grid-align-content'],
  // `justify` → justify-content (tracks); `justifyItems` → justify-items (item within cell).
  ['justify-content', 'cynosure-grid-justify'],
  ['justify-items', 'cynosure-grid-justify-items'],
];

const GRID_RULES = buildResponsiveRules(GRID_ENTRIES);

export const grid = style([
  layoutPropsStyle,
  {
    display: 'grid',
    minWidth: 0,
    ...GRID_RULES.base,
    '@media': GRID_RULES.media,
  },
]);
