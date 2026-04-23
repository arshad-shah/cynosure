import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const STACK_ENTRIES: Array<[string, string]> = [
  ['gap', 'cynosure-stack-gap'],
  ['align-items', 'cynosure-stack-align'],
  ['justify-content', 'cynosure-stack-justify'],
];

const STACK_RULES = buildResponsiveRules(STACK_ENTRIES);

export const stack = style([
  layoutPropsStyle,
  {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    ...STACK_RULES.base,
    '@media': STACK_RULES.media,
  },
]);
