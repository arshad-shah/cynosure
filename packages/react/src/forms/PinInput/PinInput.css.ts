import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
});

/** Soft accent halo that pulses in around the focused cell. */
const focusGlow = keyframes({
  from: { boxShadow: `0 0 0 0 ${vars.color.accent.soft}` },
  to: { boxShadow: `0 0 0 4px ${vars.color.accent.soft}` },
});

/**
 * A single OTP cell. Reads as a raised, rounded tile; the focused cell lifts
 * (scales up + accent ring + soft glow) so the caret position is obvious, and
 * a filled cell carries a subtle accent tint. The native caret is accent-tinted.
 */
export const cell = style({
  boxSizing: 'border-box',
  width: '2.75rem',
  height: '3rem',
  textAlign: 'center',
  fontSize: vars.font.body.lg.size,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.lg,
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  boxShadow: vars.shadow.xs,
  outline: 'none',
  padding: 0,
  cursor: 'text',
  caretColor: vars.color.accent.solid,
  transitionProperty: 'border-color, box-shadow, background-color, color, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  selectors: {
    '&:hover:not(:disabled):not(:focus)': {
      borderColor: vars.color.accent.solid,
      boxShadow: vars.shadow.sm,
    },
    // Filled cell — subtle accent tint, accent text.
    '&[data-filled="true"]': {
      borderColor: vars.color.accent.solid,
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    // Focused cell lifts above the row with an accent ring + soft glow.
    '&:focus': {
      borderColor: vars.color.accent.solid,
      background: vars.color.background.raised,
      color: vars.color.foreground.default,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, ${vars.shadow.md}`,
      transform: 'translateY(-2px) scale(1.06)',
      zIndex: 1,
      animation: `${focusGlow} ${vars.duration.normal} ${vars.easing.easeOut}`,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
      color: vars.color.feedback.danger.foreground,
    },
    '&[data-invalid="true"]:focus': {
      boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}, ${vars.shadow.md}`,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
      animation: 'none',
    },
  },
});

export const cellSize = styleVariants({
  sm: { width: '2.25rem', height: '2.5rem', fontSize: vars.font.body.md.size },
  md: { width: '2.75rem', height: '3rem', fontSize: vars.font.body.lg.size },
  lg: { width: '3.25rem', height: '3.5rem', fontSize: vars.font.heading['5'].size },
});

/** Midpoint separator (e.g. a dash) between the two halves of the code. */
export const separatorClass = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.foreground.subtle,
  fontWeight: 600,
  userSelect: 'none',
  paddingInline: vars.space['1'],
});
