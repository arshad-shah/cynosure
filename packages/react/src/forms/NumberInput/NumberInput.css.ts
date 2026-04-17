import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * NumberInput-specific wrapper addition: clip children to the wrapper's
 * border-radius so the stepper column (pulled flush via negative margin)
 * rounds with the frame. The focus ring is an outset box-shadow, so
 * `overflow: hidden` does NOT clip it.
 */
export const numberInputWrapper = style({
  overflow: 'hidden',
});

export const numberInputField = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: vars.space['1.5'],
  paddingInlineEnd: vars.space['2'],
  cursor: 'text',
  selectors: {
    '[data-disabled="true"] &': {
      cursor: 'not-allowed',
    },
  },
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

/**
 * Stepper column is pulled flush to the wrapper's border with a negative
 * inline-end margin, cancelling the wrapper's `paddingInline` (set by
 * `controlSize`). Per-size overrides live in `numberInputSteppersSize`.
 */
export const numberInputSteppers = style({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
  flex: 'none',
  borderInlineStart: `1px solid ${vars.color.border.default}`,
});

export const numberInputSteppersSize = styleVariants({
  sm: { marginInlineEnd: `calc(-1 * ${vars.space[2]})` },
  md: { marginInlineEnd: `calc(-1 * ${vars.space[3]})` },
  lg: { marginInlineEnd: `calc(-1 * ${vars.space[4]})` },
});

export const numberInputStepper = style({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: vars.space['2'],
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.background.muted,
      color: vars.color.foreground.default,
    },
    '&:active:not(:disabled)': {
      background: vars.color.border.default,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    '&:not(:first-child)': {
      borderBlockStart: `1px solid ${vars.color.border.default}`,
    },
  },
});

export const numberInputStepperSize = styleVariants({
  sm: { minWidth: '1.625rem' },
  md: { minWidth: '1.75rem' },
  lg: { minWidth: '2rem' },
});
