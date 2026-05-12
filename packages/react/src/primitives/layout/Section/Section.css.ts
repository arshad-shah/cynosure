import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../../styles/vars.css.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const sectionBase = style([
  layoutPropsStyle,
  {
    // See Flex.css.ts: drive `display` via the layoutPropsStyle var so the
    // default isn't reverted by duplicated layoutPropsStyle emissions later
    // in the bundle. `block` is the UA default for `<section>` but we still
    // need to claim the var so user-set overrides go through inline style.
    vars: { '--cynosure-lp-d-base': 'block' },
  },
]);

export const sectionSpace = styleVariants({
  sm: { paddingBlock: vars.space['6'] },
  md: { paddingBlock: vars.space['10'] },
  lg: { paddingBlock: vars.space['16'] },
  xl: { paddingBlock: vars.space['24'] },
});
