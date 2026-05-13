import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const INLINE_ENTRIES: Array<[string, string]> = [
  // See `Grid.css.ts`: `gap` shorthand would lose to the longhand entries
  // below when their vars are unset. `gap` prop writes both longhands in
  // `Inline.tsx` instead.
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
    // Drive `display` through the layoutPropsStyle custom property so this
    // primitive's default survives duplicated layoutPropsStyle emissions
    // later in the bundled stylesheet. See Flex.css.ts for the full rationale.
    vars: { '--cynosure-lp-d-base': 'flex' },
    flexDirection: 'row',
    flexWrap: 'wrap',
    minWidth: 0,
    ...INLINE_RULES.base,
    '@media': INLINE_RULES.media,
  },
]);
