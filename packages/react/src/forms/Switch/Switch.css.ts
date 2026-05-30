import { keyframes, style, styleVariants } from '@vanilla-extract/css';
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
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
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
    '&:active:not([data-disabled]):not([data-loading="true"])': {
      transform: 'scale(0.96)',
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
    width: '1.75rem', // 28 — content 24×12, thumb 12, translate 12
    height: '1rem',
    vars: {
      ['--cynosure-switch-thumb-size' as string]: '0.75rem',
      ['--cynosure-switch-translate' as string]: '0.75rem',
    },
  },
  md: {
    width: '2.25rem', // 36 — content 32×16, thumb 16, translate 16
    height: '1.25rem',
    vars: {
      ['--cynosure-switch-thumb-size' as string]: '1rem',
      ['--cynosure-switch-translate' as string]: '1rem',
    },
  },
  lg: {
    width: '2.75rem', // 44 — content 40×20, thumb 20, translate 20
    height: '1.5rem',
    vars: {
      ['--cynosure-switch-thumb-size' as string]: '1.25rem',
      ['--cynosure-switch-translate' as string]: '1.25rem',
    },
  },
});

export const switchThumb = style({
  display: 'grid',
  placeItems: 'center',
  boxSizing: 'border-box',
  width: 'var(--cynosure-switch-thumb-size)',
  height: 'var(--cynosure-switch-thumb-size)',
  background: vars.color.background.surface,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.sm,
  transitionProperty: 'transform',
  transitionDuration: vars.duration.normal,
  transitionTimingFunction: vars.easing.spring,
  transform: 'translateX(0)',
  willChange: 'transform',
  selectors: {
    '&[data-state="checked"]': {
      transform: 'translateX(var(--cynosure-switch-translate))',
    },
    '[dir="rtl"] &[data-state="checked"]': {
      transform: 'translateX(calc(-1 * var(--cynosure-switch-translate)))',
    },
  },
});

export const thumbCheck = style({
  display: 'block',
  color: vars.color.accent.solid,
  opacity: 0,
  transitionProperty: 'opacity',
  transitionDuration: vars.duration.fast,
  selectors: {
    [`${switchThumb}[data-state="checked"] &`]: {
      opacity: 1,
    },
  },
});

export const thumbCheckInvalid = style({
  selectors: {
    [`${switchThumb}[data-state="checked"] &`]: {
      color: vars.color.feedback.danger.solid,
    },
  },
});

export const thumbLoader = style({
  display: 'block',
  color: vars.color.accent.solid,
  animation: `${spin} 0.8s linear infinite`,
});
