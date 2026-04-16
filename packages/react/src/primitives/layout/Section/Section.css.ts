import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../../styles/vars.css.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const sectionBase = style([
  layoutPropsStyle,
  {
    display: 'block',
  },
]);

export const sectionSpace = styleVariants({
  sm: { paddingBlock: vars.space['6'] },
  md: { paddingBlock: vars.space['10'] },
  lg: { paddingBlock: vars.space['16'] },
  xl: { paddingBlock: vars.space['24'] },
});
