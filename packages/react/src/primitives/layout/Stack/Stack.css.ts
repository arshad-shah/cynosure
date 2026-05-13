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
    // See Flex.css.ts: drive `display` through the layoutPropsStyle var so
    // duplicated layoutPropsStyle emissions later in the bundle can't revert
    // this primitive's display to its UA default.
    vars: { '--cynosure-lp-d-base': 'flex' },
    flexDirection: 'column',
    minWidth: 0,
    ...STACK_RULES.base,
    '@media': STACK_RULES.media,
  },
]);
