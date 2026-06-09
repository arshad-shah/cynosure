import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const switchLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  color: vars.color.foreground.default,
  cursor: 'pointer',
  selectors: {
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
    },
  },
});

export const switchRoot = style({
  position: 'relative',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  background: vars.color.background.muted,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.full,
  padding: '1px',
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-6px',
    },
    '&[data-state="checked"]': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
    '&[data-disabled]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    '&[data-loading="true"]': {
      cursor: 'progress',
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"][data-state="checked"]': {
      background: vars.color.feedback.danger.solid,
      borderColor: vars.color.feedback.danger.solid,
    },
    '&[data-invalid="true"]:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
    },
  },
});

/**
 * Sizing — width ≈ 2× height so the thumb has room to slide. Each size
 * publishes `--cynosure-switch-thumb-size` and `--cynosure-switch-translate` so a
 * single `switchThumb` rule can read them, keeping the per-size cost a few
 * custom properties rather than a full recipe × 3.
 */
/**
 * Sizing — border-box geometry (project-wide default). Outer = `width`/`height`.
 * Content = outer − 2px border − 2px padding. Thumb fills content; the 1px
 * padding reads as a hairline gap around the thumb. Translate = content − thumb.
 */
export const switchSize = styleVariants({
  sm: {
    width: '1.75rem', // 28 — content 24×12
    height: '1rem',
    vars: {
      ['--cyn-sw-on' as string]: '0.75rem', // 12 — fills content height
      ['--cyn-sw-off' as string]: '0.5rem', // 8  — Material-style small rest thumb
      ['--cyn-sw-translate' as string]: '0.75rem', // 12 = content-w(24) − on(12)
    },
  },
  md: {
    width: '2.25rem', // 36 — content 32×16
    height: '1.25rem',
    vars: {
      ['--cyn-sw-on' as string]: '1rem', // 16
      ['--cyn-sw-off' as string]: '0.625rem', // 10
      ['--cyn-sw-translate' as string]: '1rem', // 16 = 32 − 16
    },
  },
  lg: {
    width: '2.75rem', // 44 — content 40×20
    height: '1.5rem',
    vars: {
      ['--cyn-sw-on' as string]: '1.25rem', // 20
      ['--cyn-sw-off' as string]: '0.8125rem', // 13
      ['--cyn-sw-translate' as string]: '1.25rem', // 20 = 40 − 20
    },
  },
});

/**
 * Material-You-style thumb: small when off, grows to fill the track when on
 * while sliding to the far end (a combined grow + slide). Set
 * `data-keep-thumb` (when an unchecked icon needs room) to opt out of the
 * shrink so the off thumb stays full size.
 */
export const switchThumb = style({
  display: 'grid',
  placeItems: 'center',
  boxSizing: 'border-box',
  width: 'var(--cyn-sw-off)',
  height: 'var(--cyn-sw-off)',
  background: vars.color.background.surface,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.sm,
  transitionProperty: 'transform, width, height',
  transitionDuration: vars.duration.normal,
  transitionTimingFunction: vars.easing.spring,
  transform: 'translateX(0)',
  willChange: 'transform, width, height',
  selectors: {
    '&[data-keep-thumb="true"]': {
      width: 'var(--cyn-sw-on)',
      height: 'var(--cyn-sw-on)',
    },
    '&[data-state="checked"]': {
      width: 'var(--cyn-sw-on)',
      height: 'var(--cyn-sw-on)',
      transform: 'translateX(var(--cyn-sw-translate))',
    },
    '[dir="rtl"] &[data-state="checked"]': {
      transform: 'translateX(calc(-1 * var(--cyn-sw-translate)))',
    },
    // Press feedback (Material-You): the resting thumb swells toward full size
    // while the switch is held, driven by the root's active state.
    [`${switchRoot}:active:not([data-disabled]):not([data-loading="true"]) &[data-state="unchecked"]`]:
      {
        width: 'var(--cyn-sw-on)',
        height: 'var(--cyn-sw-on)',
      },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  },
});

/** Icon shown inside the thumb. Centered, scales its glyph to the thumb. */
export const thumbIcon = style({
  display: 'grid',
  placeItems: 'center',
  lineHeight: 0,
});

/** On-state glyph colour (accent), tinted to danger when invalid. */
export const thumbIconChecked = style({
  color: vars.color.accent.solid,
  selectors: {
    [`${switchRoot}[data-invalid="true"] &`]: {
      color: vars.color.feedback.danger.solid,
    },
  },
});

/** Off-state glyph colour — muted, recedes against the white thumb. */
export const thumbIconUnchecked = style({
  color: vars.color.foreground.muted,
});

export const thumbLoader = style({
  display: 'block',
  color: vars.color.accent.solid,
  animation: `${spin} 0.8s linear infinite`,
});
