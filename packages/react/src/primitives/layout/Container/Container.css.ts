import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const containerBase = style([
  layoutPropsStyle,
  {
    width: '100%',
    marginInline: 'auto',
  },
]);

export const containerSize = styleVariants({
  sm: { maxWidth: '40rem' }, //  640px
  md: { maxWidth: '48rem' }, //  768px
  lg: { maxWidth: '64rem' }, // 1024px (default)
  xl: { maxWidth: '80rem' }, // 1280px
  '2xl': { maxWidth: '96rem' }, // 1536px
  prose: { maxWidth: '65ch' },
  full: { maxWidth: '100%' },
});
