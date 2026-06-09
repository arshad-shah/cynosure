import { globalStyle, style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const resizableRoot = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  selectors: {
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
    },
  },
});

export const resizablePanel = style({
  overflow: 'hidden',
});

/**
 * The divider is a hairline border at rest. A larger invisible grab zone
 * (`::after`, overhanging each side) makes it easy to grab anywhere along the
 * border; the visible line turns the accent colour while dragging.
 */
export const resizableHandle = style({
  position: 'relative',
  flex: '0 0 auto',
  background: vars.color.border.subtle,
  transitionProperty: 'background-color',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeInOut,
  selectors: {
    '[data-orientation="horizontal"] > &': { width: '2px', cursor: 'col-resize' },
    '[data-orientation="vertical"] > &': { height: '2px', cursor: 'row-resize' },
    '&:hover': { background: vars.color.border.strong },
    '&[data-resize-handle-active]': { background: vars.color.accent.solid },
    '&:focus-visible': { outline: 'none', boxShadow: focusRing, zIndex: 1 },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

// Enlarged, invisible pointer target so the divider is grabbable from a few px
// either side — pointer events on the pseudo-element route to the handle.
globalStyle(`${resizableHandle}::after`, {
  content: '""',
  position: 'absolute',
  inset: 0,
});
globalStyle(`[data-orientation="horizontal"] > ${resizableHandle}::after`, {
  insetBlock: 0,
  insetInline: '-5px',
});
globalStyle(`[data-orientation="vertical"] > ${resizableHandle}::after`, {
  insetInline: 0,
  insetBlock: '-5px',
});

/**
 * The grip — a thick, rounded line centered on the border. A neutral pill at
 * rest; on hover it firms up, and while held it grows and turns the accent
 * colour to match the divider.
 */
export const resizableHandleGrip = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 1,
  borderRadius: vars.radius.full,
  background: vars.color.border.strong,
  color: vars.color.accent.onSolid,
  transitionProperty: 'background-color, width, height',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

// Rest sizes — a vertical pill on a horizontal split, horizontal on a vertical.
globalStyle(`[data-orientation="horizontal"] ${resizableHandleGrip}`, {
  width: '4px',
  height: '1.75rem',
});
globalStyle(`[data-orientation="vertical"] ${resizableHandleGrip}`, {
  width: '1.75rem',
  height: '4px',
});

// Hover — firm up the line a touch.
globalStyle(`${resizableHandle}:hover ${resizableHandleGrip}`, {
  background: vars.color.foreground.muted,
});
globalStyle(`[data-orientation="horizontal"] ${resizableHandle}:hover ${resizableHandleGrip}`, {
  height: '2rem',
});
globalStyle(`[data-orientation="vertical"] ${resizableHandle}:hover ${resizableHandleGrip}`, {
  width: '2rem',
});

// Holding (dragging) — grow and switch to the accent, matching the divider.
globalStyle(`${resizableHandle}[data-resize-handle-active] ${resizableHandleGrip}`, {
  background: vars.color.accent.solid,
});
globalStyle(
  `[data-orientation="horizontal"] ${resizableHandle}[data-resize-handle-active] ${resizableHandleGrip}`,
  { width: '5px', height: '2.25rem' },
);
globalStyle(
  `[data-orientation="vertical"] ${resizableHandle}[data-resize-handle-active] ${resizableHandleGrip}`,
  { width: '2.25rem', height: '5px' },
);
