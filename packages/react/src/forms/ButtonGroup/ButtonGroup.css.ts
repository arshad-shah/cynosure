import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const buttonGroup = style({
  display: 'inline-flex',
  gap: vars.space['2'],
});

/**
 * Attached mode squishes buttons into a visually joined segmented control.
 * Each middle button loses its rounded sides; non-first buttons pull their
 * borders in by `-1px` so adjacent borders merge into one. vanilla-extract
 * rejects descendant selectors in `selectors`, so the children are styled
 * via `globalStyle` scoped to the attached class.
 */
export const buttonGroupAttached = style({
  display: 'inline-flex',
  gap: 0,
});

globalStyle(`${buttonGroupAttached} > *:not(:first-child):not(:last-child)`, {
  borderRadius: 0,
});
globalStyle(`${buttonGroupAttached} > *:first-child:not(:last-child)`, {
  borderStartEndRadius: 0,
  borderEndEndRadius: 0,
});
globalStyle(`${buttonGroupAttached} > *:last-child:not(:first-child)`, {
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
});
globalStyle(`${buttonGroupAttached} > *:not(:first-child)`, {
  marginInlineStart: '-1px',
});
