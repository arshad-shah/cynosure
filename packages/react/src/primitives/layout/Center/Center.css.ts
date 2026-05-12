import { style } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const center = style([
  layoutPropsStyle,
  {
    // See Flex.css.ts: drive `display` via the layoutPropsStyle var to survive
    // duplicated layoutPropsStyle emissions in the bundled stylesheet.
    vars: { '--cynosure-lp-d-base': 'flex' },
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
]);
