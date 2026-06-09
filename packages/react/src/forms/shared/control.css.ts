import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/**
 * Shared sizing scale for text-like form controls (`Input`, `Textarea`,
 * `NumberInput`). Keeping this in one place means every control has the
 * same heights / paddings / fonts at a given `size`.
 */
export const controlSize = styleVariants({
  sm: {
    minHeight: '2rem',
    paddingInline: vars.space[2],
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
    borderRadius: vars.radius.sm,
  },
  md: {
    minHeight: '2.5rem',
    paddingInline: vars.space[3],
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
    borderRadius: vars.radius.md,
  },
  lg: {
    minHeight: '3rem',
    paddingInline: vars.space[4],
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
    borderRadius: vars.radius.md,
  },
});

/**
 * "Punched card" control frame. The field sits in a subtly recessed well with
 * a hairline inner shadow, so it reads as a slot stamped into the host
 * surface. Focus lifts the field to `background.surface` with an accent ring.
 */
export const controlWrapperBase = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  background: vars.color.background.subtle,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  boxShadow: `inset 0 1px 0 color-mix(in oklab, ${vars.color.foreground.default} 4%, transparent)`,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
      borderColor: vars.color.border.strong,
    },
    '&[data-focus-within="true"]:not([data-invalid="true"])': {
      background: vars.color.background.surface,
      borderColor: vars.color.border.focus,
      boxShadow: focusRing,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"][data-focus-within="true"]': {
      background: vars.color.background.surface,
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

export const controlWrapperVariant = styleVariants({
  /** Default punched well — subtle recessed background, hairline border. */
  outline: {},
  /** Deeper recess — `background.muted`, border recedes so only the color says "pocket". */
  filled: {
    background: vars.color.background.muted,
    borderColor: 'transparent',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"])': {
        borderColor: vars.color.border.strong,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.surface,
      },
    },
  },
  /** Minimal — no well at rest; the frame only appears on hover / focus. */
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"])': {
        background: vars.color.background.subtle,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.surface,
        boxShadow: focusRing,
      },
    },
  },
});

/** The raw `<input>`/`<textarea>` itself — no border/bg, just text layout. */
export const controlField = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  paddingBlock: vars.space[1],
  selectors: {
    '&::placeholder': {
      color: vars.color.foreground.subtle,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

/** Left / right addon — visually joined block (e.g. `"https://"`, `".com"`). */
export const controlAddon = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: vars.space[3],
  background: vars.color.background.muted,
  color: vars.color.foreground.muted,
  fontSize: '0.875em',
  whiteSpace: 'nowrap',
});

export const controlAddonLeft = style([
  controlAddon,
  {
    borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
  },
]);

export const controlAddonRight = style([
  controlAddon,
  {
    borderInlineStart: `1px solid ${vars.color.border.subtle}`,
  },
]);

/** Left/right element — an icon or button inside the input, no border. */
export const controlElement = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: vars.space[2],
  color: vars.color.foreground.muted,
  pointerEvents: 'none',
});

// Buttons rendered inside the element wrapper still need pointer events;
// vanilla-extract's `selectors` map can't target descendant intrinsics, so
// two globalStyle rules handle the two shapes we care about.
globalStyle(`${controlElement} button`, { pointerEvents: 'auto' });
globalStyle(`${controlElement} [role="button"]`, { pointerEvents: 'auto' });

/**
 * The raised segment tile used as the tactile unit across multi-well form
 * controls (DatePicker, Input, and any future ones). A white `raised` surface
 * with a hairline shadow that floats inside the shared segmented track —
 * the same language as `NumberInput`'s `[ − ][ value ][ + ]` segments. The
 * transparent 1px border keeps layout stable while letting consumers tint
 * `borderColor` for hover / focus / invalid states.
 *
 * This is a bare tile — consumers pair it with a data-driven parent
 * (`[data-variant]`, `[data-invalid]`, `[data-readonly]`, `[data-disabled]`)
 * so all wells in a row react in lockstep. Those selectors live in the
 * parent component's CSS, not here, because each parent node is different.
 */
export const fieldWellBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '2.5rem',
  background: vars.color.background.raised,
  border: '1px solid transparent',
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.xs,
  transitionProperty: 'background-color, border-color, box-shadow, color',
  transitionDuration: vars.duration.fast,
  color: vars.color.foreground.default,
});
