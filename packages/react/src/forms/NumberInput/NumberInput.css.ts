import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/**
 * Segmented `NumberInput` styles: a tinted **track** wraps three raised
 * **segments** — `[ − ][ value ][ + ]`. The track owns the focus ring (an
 * outset box-shadow) so the whole control lights up when the field is focused,
 * the same way `Input` does. `data-variant` on the track tints it (the segment
 * layout never changes); `data-invalid` / `data-disabled` / `data-readonly`
 * mirror the field state so every segment reacts in lockstep.
 */

/** Tinted container. Padded so the raised segments float inside a rounded well. */
export const numberInputTrack = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid transparent',
  // Default (outline) well — a light tint. `filled` deepens it, `ghost` clears
  // it (see `numberInputTrackVariant`).
  background: vars.color.background.subtle,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-focus-within="true"]:not([data-invalid="true"])': {
      borderColor: vars.color.border.focus,
      boxShadow: focusRing,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"][data-focus-within="true"]': {
      boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
    },
    '&[data-readonly="true"]': {
      background: vars.color.background.muted,
    },
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  },
});

/** Track tinting per variant — structure stays constant, only the well changes. */
export const numberInputTrackVariant = styleVariants({
  /** Light tinted well + hairline border (the base look). */
  outline: { borderColor: vars.color.border.subtle },
  /** Deeper solid tint, no border — reads as a stronger pocket. */
  filled: { background: vars.color.background.muted, borderColor: 'transparent' },
  /** No well at rest — track is transparent, segments stay flat until hover. */
  ghost: { background: 'transparent', borderColor: 'transparent' },
});

/** Track padding / gap / outer radius / font scale. */
export const numberInputTrackSize = styleVariants({
  sm: {
    padding: vars.space['1'],
    gap: vars.space['1'],
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  },
  md: {
    padding: vars.space['1'],
    gap: vars.space['1'],
    borderRadius: vars.radius.lg,
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
  },
  lg: {
    padding: vars.space['1.5'],
    gap: vars.space['1.5'],
    borderRadius: vars.radius.lg,
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
  },
});

/**
 * Shared raised-segment surface. Reads as a tile lifted off the track with a
 * hairline shadow. In `ghost` the surface drops to transparent until hovered.
 */
const segmentBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  border: 'none',
  // Raised white tile so each segment pops off the tinted track.
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  boxShadow: vars.shadow.xs,
  transitionProperty: 'background-color, box-shadow, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '[data-variant="ghost"] &': {
      background: 'transparent',
      boxShadow: 'none',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  },
});

/** Segment height + corner radius (applied to all three segments). */
export const numberInputSegmentSize = styleVariants({
  sm: { minHeight: '2rem', borderRadius: vars.radius.sm },
  md: { minHeight: '2.75rem', borderRadius: vars.radius.md },
  lg: { minHeight: '3.25rem', borderRadius: vars.radius.md },
});

/** − / + buttons: equal-width raised targets with pressed/hover feedback. */
export const numberInputStepButton = style([
  segmentBase,
  {
    flex: 'none',
    cursor: 'pointer',
    color: vars.color.foreground.muted,
    outline: 'none',
    selectors: {
      // Hover tints toward the accent so the raised white tile shows a clear
      // affordance (matches the segmented-control language elsewhere).
      '&[data-hover="true"]': {
        background: vars.color.accent.soft,
        color: vars.color.accent.solid,
      },
      // Pressed feedback — depress into the accent. Mouse, touch, and pen all
      // surface `data-pressed` via react-aria's press handling.
      '&[data-pressed="true"]': {
        background: vars.color.accent.solid,
        color: vars.color.accent.onSolid,
        boxShadow: 'none',
      },
      '&[data-focus-visible="true"]': {
        boxShadow: focusRing,
      },
      '&[data-disabled="true"]': {
        cursor: 'not-allowed',
        opacity: 0.5,
        background: 'transparent',
        boxShadow: 'none',
      },
      // Ghost: flat until hover, then borrow the raised surface.
      '[data-variant="ghost"] &[data-hover="true"]': {
        background: vars.color.accent.soft,
        boxShadow: vars.shadow.xs,
      },
    },
  },
]);

/** Equal-width sizing for the − / + buttons — square-ish, touch-friendly. */
export const numberInputStepButtonSize = styleVariants({
  sm: { minWidth: '2rem' },
  md: { minWidth: '2.75rem' },
  lg: { minWidth: '3.25rem' },
});

/** Center segment: flexes to fill, hosts the editable field + affixes. */
export const numberInputValueSegment = style([
  segmentBase,
  {
    flex: 1,
    minWidth: 0,
    cursor: 'text',
    selectors: {
      '[data-disabled="true"] &': { cursor: 'not-allowed' },
    },
  },
]);

/** Inner flex line inside the value segment: prefix · input · suffix, centered. */
export const numberInputField = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  gap: vars.space['1'],
});

export const numberInputFieldSize = styleVariants({
  sm: { paddingInline: vars.space['2'] },
  md: { paddingInline: vars.space['3'] },
  lg: { paddingInline: vars.space['3'] },
});

export const numberInputAffix = style({
  flex: 'none',
  color: vars.color.foreground.muted,
  fontSize: '0.875em',
  fontWeight: 500,
  letterSpacing: '0.01em',
  userSelect: 'none',
  pointerEvents: 'none',
});

export const numberInputInput = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'center',
  padding: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.foreground.subtle,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});
