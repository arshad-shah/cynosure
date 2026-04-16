import { style } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

/**
 * Box's own class. It only composes the shared layout-prop rules — Box has no
 * opinion beyond "render the layout props the user passed". Keeping it as its
 * own class (rather than exporting `layoutPropsStyle` as-is) lets future Box
 * overrides land here without touching the shared style.
 */
export const box = style([layoutPropsStyle]);
