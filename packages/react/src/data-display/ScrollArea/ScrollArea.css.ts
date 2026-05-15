import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const scrollAreaRoot = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

/**
 * Token-driven scrollbar styling via the Baseline-2024 `scrollbar-*`
 * properties. `scrollbar-width: thin` collapses the rail to ~8 px on
 * Firefox / WebKit / Blink — visually consistent with the previous custom
 * thumb. `scrollbar-color` pulls the thumb from the muted ramp so it sits
 * below primary chrome.
 *
 * `type="hover"` overrides via the parent data-attribute to keep the
 * thumb transparent until pointer enters the area. Older browsers (no
 * `scrollbar-*` support) get the OS scrollbar — visually different,
 * behaviour identical.
 */
export const scrollAreaViewport = style({
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.color.border.strong} transparent`,
  selectors: {
    '&[data-scroll-type="hover"]': {
      scrollbarColor: 'transparent transparent',
    },
    '&[data-scroll-type="hover"]:hover': {
      scrollbarColor: `${vars.color.border.strong} transparent`,
    },
  },
});

/**
 * @deprecated Legacy export from the Radix implementation — no longer
 * used. Kept for backwards-compat if a consumer imported the class name
 * directly; will be removed in the next major.
 */
export const scrollAreaScrollbar = style({});
/** @deprecated see {@link scrollAreaScrollbar}. */
export const scrollAreaThumb = style({});
/** @deprecated see {@link scrollAreaScrollbar}. */
export const scrollAreaCorner = style({});
