import { style } from '@vanilla-extract/css';
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
 * The handle is a generous hit target (`8px`) with a centered 1px visual
 * line (rendered via `::before`). On hover, focus, or active drag the line
 * thickens and turns accent so the entire edge between the panels lights up.
 */
export const resizableHandle = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  background: 'transparent',
  transition: `background ${vars.duration.fast} ease`,
  selectors: {
    // Hit target + visible line — horizontal layout (vertical divider)
    '[data-orientation="horizontal"] > &': {
      width: 8,
      cursor: 'col-resize',
    },
    '[data-orientation="vertical"] > &': {
      height: 8,
      cursor: 'row-resize',
    },
    // The accent line itself — drawn as a pseudo element so the hit target
    // can stay wide while the visible affordance is just 1–2px.
    '[data-orientation="horizontal"] > &::before': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: '50%',
      width: 1,
      transform: 'translateX(-50%)',
      background: vars.color.border.default,
      transition: `background ${vars.duration.fast} ease, width ${vars.duration.fast} ease`,
    },
    '[data-orientation="vertical"] > &::before': {
      content: '""',
      position: 'absolute',
      insetInline: 0,
      insetBlockStart: '50%',
      height: 1,
      transform: 'translateY(-50%)',
      background: vars.color.border.default,
      transition: `background ${vars.duration.fast} ease, height ${vars.duration.fast} ease`,
    },
    // Hover & keyboard focus — thicken the line and tint it.
    '&:hover::before, &[data-separator="focus"]::before': {
      background: vars.color.accent.solid,
    },
    '[data-orientation="horizontal"] > &:hover::before, [data-orientation="horizontal"] > &[data-separator="focus"]::before':
      {
        width: 2,
      },
    '[data-orientation="vertical"] > &:hover::before, [data-orientation="vertical"] > &[data-separator="focus"]::before':
      {
        height: 2,
      },
    // Active drag — full edge lights up accent, line is at its thickest.
    '&[data-separator="active"]::before': {
      background: vars.color.accent.solid,
    },
    '[data-orientation="horizontal"] > &[data-separator="active"]::before': {
      width: 2,
    },
    '[data-orientation="vertical"] > &[data-separator="active"]::before': {
      height: 2,
    },
    // Remove the default focus ring; the line treatment already signals focus.
    '&:focus-visible': {
      outline: 'none',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
      selectors: {
        '&::before': { transition: 'none' },
      },
    },
  },
});

/**
 * Three-dot grip indicator centered on the handle. Sits on top of the accent
 * line during drag/hover so the moving edge always has a clear affordance.
 * The dot stack is oriented *perpendicular* to the resize axis (so a vertical
 * handle gets stacked dots — three dots top-to-bottom — and a horizontal
 * handle gets the three dots in a row).
 */
export const resizableHandleGrip = style({
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  paddingBlock: 4,
  paddingInline: 4,
  borderRadius: vars.radius.full,
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.default}`,
  color: vars.color.accent.solid,
  opacity: 0,
  transform: 'scale(0.85)',
  pointerEvents: 'none',
  transition: `opacity ${vars.duration.fast} ease, transform ${vars.duration.fast} ease, background ${vars.duration.fast} ease, border-color ${vars.duration.fast} ease, color ${vars.duration.fast} ease`,
  selectors: {
    // Stack dots vertically when the divider is vertical (horizontal layout).
    '[data-orientation="horizontal"] > * > &': {
      flexDirection: 'column',
    },
    // Stack dots horizontally when the divider is horizontal (vertical layout).
    '[data-orientation="vertical"] > * > &': {
      flexDirection: 'row',
    },
    // Visible on hover, keyboard focus, and during active drag only.
    '*:hover > &, [data-separator="focus"] > &, [data-separator="active"] > &': {
      opacity: 1,
      transform: 'scale(1)',
      borderColor: vars.color.accent.solid,
    },
    // During active drag the grip flips to a filled accent pill for emphasis.
    '[data-separator="active"] > &': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

/** A single dot in the {@link resizableHandleGrip} stack. Three of these render. */
export const resizableHandleDot = style({
  width: 3,
  height: 3,
  borderRadius: vars.radius.full,
  background: 'currentColor',
  flex: '0 0 auto',
});
