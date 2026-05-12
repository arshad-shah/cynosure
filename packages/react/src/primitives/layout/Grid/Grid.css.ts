import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const GRID_ENTRIES: Array<[string, string]> = [
  ['grid-template-columns', 'cynosure-grid-cols'],
  ['grid-template-rows', 'cynosure-grid-rows'],
  ['grid-auto-flow', 'cynosure-grid-flow'],
  ['grid-auto-columns', 'cynosure-grid-auto-cols'],
  ['grid-auto-rows', 'cynosure-grid-auto-rows'],
  // Don't emit the `gap` shorthand here. CSS expands `gap` into `row-gap` +
  // `column-gap`, then the longhand entries that follow re-bind both to
  // their own vars. When the consumer only sets the `gap` prop, those
  // longhand vars stay unset, the longhand `column-gap: var(...)` resolves
  // to "invalid at computed value time", reverts to `normal`, and clobbers
  // what `gap` had just set. Instead, the `gap` prop in `Grid.tsx` writes
  // to BOTH longhand vars; `columnGap` / `rowGap` props override
  // individually via the same merge step.
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
    // See Flex.css.ts: drive `display` via the layoutPropsStyle var to survive
    // duplicated layoutPropsStyle emissions in the bundled stylesheet.
    vars: { '--cynosure-lp-d-base': 'grid' },
    minWidth: 0,
    ...GRID_RULES.base,
    '@media': GRID_RULES.media,
  },
]);
