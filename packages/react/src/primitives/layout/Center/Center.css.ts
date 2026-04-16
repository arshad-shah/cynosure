import { style } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const center = style([
  layoutPropsStyle,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
]);
