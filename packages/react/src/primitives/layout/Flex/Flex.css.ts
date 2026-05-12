import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

const FLEX_ENTRIES: Array<[string, string]> = [
  ['flex-direction', 'cynosure-flex-dir'],
  ['flex-wrap', 'cynosure-flex-wrap'],
  ['flex-grow', 'cynosure-flex-grow'],
  ['flex-shrink', 'cynosure-flex-shrink'],
  ['flex-basis', 'cynosure-flex-basis'],
  // See `Grid.css.ts`: emitting `gap` shorthand here would silently lose
  // to the `row-gap` / `column-gap` longhands below because their vars are
  // unset → revert to `normal`. `gap` prop writes to both longhand vars in
  // `Flex.tsx` instead.
  ['row-gap', 'cynosure-flex-row-gap'],
  ['column-gap', 'cynosure-flex-col-gap'],
  ['align-items', 'cynosure-flex-align'],
  ['justify-content', 'cynosure-flex-justify'],
];

const FLEX_RULES = buildResponsiveRules(FLEX_ENTRIES);

export const flex = style([
  layoutPropsStyle,
  {
    // Drive the layoutPropsStyle `display: var(--cynosure-lp-d-base)` resolver
    // via the same custom property so that this primitive's display default
    // can't be silently undone when later modules re-emit layoutPropsStyle
    // into the bundled stylesheet. Setting `display: flex` directly here is
    // not enough — duplicated rule emissions for layoutPropsStyle further
    // down the cascade would otherwise revert `display` to its UA default.
    // Users can still override via the `display` prop, which sets the var
    // inline (inline styles win over class-defined custom properties).
    vars: { '--cynosure-lp-d-base': 'flex' },
    // Prevents flex children from overflowing their container on narrow tracks.
    minWidth: 0,
    ...FLEX_RULES.base,
    '@media': FLEX_RULES.media,
  },
]);
