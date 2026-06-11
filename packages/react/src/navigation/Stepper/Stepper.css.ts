import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/*
 * Stepper layout. Each Step renders a single connector "track" containing
 * `[ before-arm ][ marker ][ after-arm ]`, with `flex: 1` on each arm so the
 * marker stays centred and the line fills out to the item's edges. Adjacent
 * tracks abut (`gap: 0` on the root), so item N's `after-arm` and item N+1's
 * `before-arm` meet at the boundary and the line reads as one continuous run
 * from marker to marker — no gaps.
 *
 * Vertical orientation uses the same structure rotated 90°: the track is a
 * column with line arms above/below the marker, items abut, lines join at
 * the item boundary.
 *
 * Marker size is driven by `--cynosure-stepper-marker` set on the root per
 * size variant.
 */

export const stepperRoot = style({
  display: 'flex',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  // Zero gap so adjacent connector arms touch at the item boundary.
  gap: 0,
  selectors: {
    '&[data-orientation="horizontal"]': {
      alignItems: 'flex-start',
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
    },
  },
});

// Marker size + font size bundle. The connector arms read the same variable
// so their cross-axis thickness stays aligned with the marker's centre.
export const stepperRootSize = styleVariants({
  sm: {
    vars: {
      '--cynosure-stepper-marker': '1.5rem',
      '--cynosure-stepper-marker-font': vars.font.body.xs.size,
    },
  },
  md: {
    vars: {
      '--cynosure-stepper-marker': '1.75rem',
      '--cynosure-stepper-marker-font': vars.font.body.sm.size,
    },
  },
  lg: {
    vars: {
      '--cynosure-stepper-marker': '2.25rem',
      '--cynosure-stepper-marker-font': vars.font.body.md.size,
    },
  },
});

export const stepperItem = style({
  display: 'flex',
  flex: '1 1 0',
  minWidth: 0,
  // Horizontal orientation: marker track on top, label centred below.
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: vars.space['2'],
  selectors: {
    '[data-orientation="vertical"] > &': {
      flex: '0 0 auto',
      flexDirection: 'row',
      alignItems: 'stretch',
      textAlign: 'start',
      gap: vars.space['2'],
    },
  },
});

export const stepperBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  minWidth: 0,
  selectors: {
    '[data-orientation="horizontal"] > * > &': {
      // Centred under the marker; bounded so long titles wrap instead of
      // pushing the column wider than its share of the row.
      maxWidth: '14rem',
      alignItems: 'center',
    },
    '[data-orientation="vertical"] > * > &': {
      flex: '1 1 auto',
      // Pad the top so a single-line title aligns optically with the marker.
      paddingBlock: 'calc((var(--cynosure-stepper-marker, 1.75rem) - 1.3em) / 2)',
      paddingBlockEnd: vars.space['3'],
    },
  },
});

export const stepperButton = style({
  display: 'flex',
  flexDirection: 'inherit',
  alignItems: 'inherit',
  textAlign: 'inherit',
  gap: vars.space['2'],
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  padding: 0,
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  // Stretch on the item's cross axis so the inner track fills its full
  // width (horizontal mode) or height (vertical mode). Without this the
  // button shrinks to its content and the connector arms collapse,
  // leaving big visible gaps between markers in the interactive variant.
  alignSelf: 'stretch',
  width: '100%',
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadow.focusRing,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

/*
 * One track per Step: `[ beforeArm ][ marker ][ afterArm ]`. The marker is
 * `flex: 0 0 auto`; each arm is `flex: 1 1 0` so the marker is pinned at
 * track centre and the arms fill the remaining width. With `gap: 0` on the
 * root, adjacent tracks touch — item N's afterArm and item N+1's beforeArm
 * abut, and because they evaluate to the same `data-complete` value the
 * seam is invisible.
 */
export const stepperConnectorTrack = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  // Reserve a row exactly the marker's height so the arm baseline always
  // matches the marker's vertical centre.
  height: 'var(--cynosure-stepper-marker, 1.75rem)',
  flex: '0 0 auto',
  selectors: {
    '[data-orientation="vertical"] > * > &': {
      flexDirection: 'column',
      width: 'var(--cynosure-stepper-marker, 1.75rem)',
      height: 'auto',
      // Stretches the track to the full height of the item so the arms
      // extend up to the previous marker and down to the next.
      alignSelf: 'stretch',
      // Sized to the marker; needs no fixed height in this axis.
      minHeight: 'var(--cynosure-stepper-marker, 1.75rem)',
    },
  },
});

const arm = style({
  flex: '1 1 0',
  minWidth: 0,
  background: vars.color.border.default,
  transitionProperty: 'background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '[data-orientation="horizontal"] &': {
      height: '2px',
    },
    '[data-orientation="vertical"] &': {
      width: '2px',
      minHeight: vars.space['4'],
    },
    '&[data-complete="true"]': {
      background: vars.color.accent.solid,
    },
    '&[data-hidden="true"]': {
      visibility: 'hidden',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const stepperConnectorBefore = style([arm]);
export const stepperConnectorAfter = style([arm]);

export const stepperMarker = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: 'var(--cynosure-stepper-marker, 1.75rem)',
  height: 'var(--cynosure-stepper-marker, 1.75rem)',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
  color: vars.color.foreground.muted,
  fontFamily: vars.font.body.sm.family,
  fontSize: 'var(--cynosure-stepper-marker-font, var(--cynosure-font-body-sm-size))',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  transitionProperty: 'background-color, color, border-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-status="active"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[data-status="complete"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[data-status="error"]': {
      background: vars.color.feedback.danger.solid,
      color: vars.color.feedback.danger.onSolid,
      borderColor: vars.color.feedback.danger.border,
    },
    [`${stepperButton}:hover &[data-status="complete"]`]: {
      background: vars.color.accent.solidHover,
      borderColor: vars.color.accent.solidHover,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const stepperTitle = style({
  fontFamily: vars.font.body.md.family,
  fontSize: vars.font.body.md.size,
  fontWeight: 600,
  color: vars.color.foreground.default,
  margin: 0,
  lineHeight: 1.3,
  selectors: {
    '[data-status="pending"] &': {
      color: vars.color.foreground.muted,
      fontWeight: 500,
    },
    '[data-status="error"] &': {
      color: vars.color.feedback.danger.foreground,
    },
  },
});

export const stepperDescription = style({
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  margin: 0,
  lineHeight: 1.4,
});

export const stepperVariant = styleVariants({
  numbered: {},
  dots: {},
  lines: {},
  icons: {},
});

export const stepperVariantDot = style({
  // Dot variant — small filled circle (no number / icon).
  width: 'calc(var(--cynosure-stepper-marker, 1.75rem) * 0.45)',
  height: 'calc(var(--cynosure-stepper-marker, 1.75rem) * 0.45)',
  border: 'none',
});

export const stepperVariantLine = style({
  // Lines variant — short bar replacing the marker.
  width: 'var(--cynosure-stepper-marker, 1.75rem)',
  height: '3px',
  borderRadius: vars.radius.full,
  border: 'none',
  background: vars.color.border.subtle,
  selectors: {
    '&[data-status="active"], &[data-status="complete"]': {
      background: vars.color.accent.solid,
    },
  },
});
