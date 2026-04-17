import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
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
    fontSize: 'var(--lumen-font-body-sm-size)',
    lineHeight: 'var(--lumen-font-body-sm-line-height)',
    borderRadius: vars.radius.sm,
  },
  md: {
    minHeight: '2.5rem',
    paddingInline: vars.space[3],
    fontSize: 'var(--lumen-font-body-md-size)',
    lineHeight: 'var(--lumen-font-body-md-line-height)',
    borderRadius: vars.radius.md,
  },
  lg: {
    minHeight: '3rem',
    paddingInline: vars.space[4],
    fontSize: 'var(--lumen-font-body-lg-size)',
    lineHeight: 'var(--lumen-font-body-lg-line-height)',
    borderRadius: vars.radius.md,
  },
});

/** Wrapper class that paints the border/bg/focus ring around the raw control. */
export const controlWrapperBase = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
      borderColor: vars.color.border.strong,
    },
    '&[data-focus-within="true"]:not([data-invalid="true"])': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
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
      background: vars.color.background.subtle,
    },
  },
});

export const controlWrapperVariant = styleVariants({
  outline: {
    background: vars.color.background.surface,
  },
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
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"])': {
        background: vars.color.background.subtle,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.surface,
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
