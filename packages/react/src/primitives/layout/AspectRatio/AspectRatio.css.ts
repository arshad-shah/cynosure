import { style } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

export const aspectRatio = style([
  layoutPropsStyle,
  {
    position: 'relative',
    width: '100%',
    aspectRatio: 'var(--cynosure-aspect-ratio, 1)',
  },
]);

/**
 * Stretches the single child to fill the ratio container.
 */
export const aspectRatioChild = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
});
