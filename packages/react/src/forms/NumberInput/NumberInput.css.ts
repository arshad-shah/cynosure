import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/**
 * Segmented NumberInput — `[ − ][ value ][ + ]`.
 *
 * The **track** is the tinted, padded frame that holds three raised segments.
 * It owns the focus ring (an outset box-shadow), the variant tint, and the
 * shared `data-*` state hooks (`data-disabled` / `data-readonly` /
 * `data-invalid` / `data-focus-within`) that the segments react to via
 * ancestor selectors — the same lockstep pattern the multi-well controls use.
 */
export const numberInputTrack = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.default}`,
  boxShadow: `inset 0 1px 0 color-mix(in oklab, ${vars.color.foreground.default} 4%, transparent)`,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
      borderColor: vars.color.border.strong,
    },
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
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
      borderColor: vars.color.border.disabled,
    },
    '&[data-readonly="true"]': {
      background: vars.color.background.muted,
    },
  },
});

/** Variant tints the track only — the segmented structure is constant. */
export const numberInputTrackVariant = styleVariants({
  /** Tinted well + hairline border (default). */
  outline: {},
  /** Stronger solid fill, border recedes. */
  filled: {
    background: vars.color.background.muted,
    borderColor: 'transparent',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
        borderColor: vars.color.border.strong,
      },
    },
  },
  /** Transparent track — the frame only appears on hover / focus. */
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
        background: vars.color.background.subtle,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.subtle,
      },
    },
  },
});

/** Track sizing: outer radius, padding, and the gap between segments. */
export const numberInputTrackSize = styleVariants({
  sm: {
    gap: vars.space['0.5'],
    padding: vars.space['0.5'],
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  },
  md: {
    gap: vars.space['1'],
    padding: vars.space['1'],
    borderRadius: vars.radius.lg,
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
  },
  lg: {
    gap: vars.space['1'],
    padding: vars.space['1'],
    borderRadius: vars.radius.lg,
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
  },
});

/**
 * Raised surface shared by all three segments — the `−` / `+` buttons and the
 * value well. A subtle fill + hairline shadow lifts each segment off the
 * track. `ghost` flattens them until hover (via the ancestor `data-variant`).
 */
const segmentRaise = {
  background: vars.color.background.canvas,
  boxShadow: `inset 0 0 0 1px ${vars.color.border.subtle}, ${vars.shadow.xs}`,
};

/** The − / + stepper segments. Equal width, large tap target, own radius. */
export const numberInputStepper = style({
  ...segmentRaise,
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  color: vars.color.foreground.default,
  cursor: 'pointer',
  transitionProperty: 'background-color, box-shadow, color, transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-hover="true"]:not([data-disabled])': {
      background: vars.color.background.surface,
      color: vars.color.foreground.default,
    },
    // Pressed (pointer-down) feedback — accent fill, per token guidance.
    '&[data-pressed]:not([data-disabled])': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      boxShadow: 'none',
    },
    '&[data-focus-visible]': {
      outline: 'none',
      boxShadow: focusRing,
    },
    '&[data-disabled]': {
      cursor: 'not-allowed',
      color: vars.color.foreground.disabled,
      boxShadow: 'none',
      background: 'transparent',
    },
    // Ghost: segments stay flat until hover / press.
    '[data-variant="ghost"] &:not([data-hover="true"]):not([data-pressed])': {
      background: 'transparent',
      boxShadow: 'none',
    },
    // Read-only: steppers are inert and lose their raise.
    '[data-readonly="true"] &': {
      background: 'transparent',
      boxShadow: 'none',
      cursor: 'default',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
});

/** Per-size stepper geometry. `md` targets a ~44px touch target. */
export const numberInputStepperSize = styleVariants({
  sm: { minWidth: '2rem', minHeight: '2rem', borderRadius: vars.radius.sm },
  md: { minWidth: '2.75rem', minHeight: '2.75rem', borderRadius: vars.radius.md },
  lg: { minWidth: '3.25rem', minHeight: '3.25rem', borderRadius: vars.radius.md },
});

/** The editable value segment — flexes to fill, holds the input + affixes. */
export const numberInputValue = style({
  ...segmentRaise,
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['1'],
  paddingInline: vars.space['3'],
  color: vars.color.foreground.default,
  cursor: 'text',
  transitionProperty: 'background-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    // Ghost: the value well is flat until the control is focused.
    '[data-variant="ghost"] &': {
      background: 'transparent',
      boxShadow: 'none',
    },
    '[data-variant="ghost"][data-focus-within="true"] &': {
      background: vars.color.background.canvas,
      boxShadow: `inset 0 0 0 1px ${vars.color.border.subtle}, ${vars.shadow.xs}`,
    },
    '[data-readonly="true"] &': {
      boxShadow: 'none',
    },
    '[data-disabled="true"] &': {
      cursor: 'not-allowed',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
});

export const numberInputValueSize = styleVariants({
  sm: { minHeight: '2rem', borderRadius: vars.radius.sm },
  md: { minHeight: '2.75rem', borderRadius: vars.radius.md },
  lg: { minHeight: '3.25rem', borderRadius: vars.radius.md },
});

export const numberInputAffix = style({
  flex: 'none',
  color: vars.color.foreground.muted,
  fontSize: '0.875em',
  fontWeight: 500,
  letterSpacing: '0.01em',
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
  pointerEvents: 'none',
});

export const numberInputInput = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
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
