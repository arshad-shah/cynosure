import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const switchLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  fontSize: 'var(--lumen-font-body-md-size)',
  lineHeight: 'var(--lumen-font-body-md-line-height)',
  color: vars.color.foreground.default,
  cursor: 'pointer',
  selectors: {
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
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
  padding: '2px',
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
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
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
  },
});

/**
 * Sizing — width ≈ 2× height so the thumb has room to slide. Each size
 * publishes `--lumen-switch-thumb-size` and `--lumen-switch-translate` so a
 * single `switchThumb` rule can read them, keeping the per-size cost a few
 * custom properties rather than a full recipe × 3.
 */
export const switchSize = styleVariants({
  sm: {
    width: '1.75rem',
    height: '1rem',
    vars: {
      ['--lumen-switch-thumb-size' as string]: '0.75rem',
      ['--lumen-switch-translate' as string]: '0.75rem',
    },
  },
  md: {
    width: '2.25rem',
    height: '1.25rem',
    vars: {
      ['--lumen-switch-thumb-size' as string]: '1rem',
      ['--lumen-switch-translate' as string]: '1rem',
    },
  },
  lg: {
    width: '2.75rem',
    height: '1.5rem',
    vars: {
      ['--lumen-switch-thumb-size' as string]: '1.25rem',
      ['--lumen-switch-translate' as string]: '1.25rem',
    },
  },
});

export const switchThumb = style({
  display: 'block',
  width: 'var(--lumen-switch-thumb-size)',
  height: 'var(--lumen-switch-thumb-size)',
  background: vars.color.background.surface,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.sm,
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  transform: 'translateX(0)',
  selectors: {
    '&[data-state="checked"]': {
      transform: 'translateX(var(--lumen-switch-translate))',
    },
    '[dir="rtl"] &[data-state="checked"]': {
      transform: 'translateX(calc(-1 * var(--lumen-switch-translate)))',
    },
  },
});
