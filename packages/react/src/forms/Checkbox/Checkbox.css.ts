import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const popIn = keyframes({
  '0%': { transform: 'scale(0.5)', opacity: 0 },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

export const checkboxLabel = style({
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

export const checkboxRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: vars.color.background.surface,
  border: `1.5px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.sm,
  color: vars.color.accent.onSolid,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow, transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not([data-disabled="true"]):not([data-state="checked"]):not([data-state="indeterminate"])':
      {
        borderColor: vars.color.accent.solid,
        background: vars.color.background.raised,
      },
    '&[data-state="checked"], &[data-state="indeterminate"]': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${vars.color.accent.ring}`,
    },
    '&:active:not([data-disabled="true"])': {
      transform: 'scale(0.94)',
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const checkboxSize = styleVariants({
  sm: { width: '1.125rem', height: '1.125rem' },
  md: { width: '1.375rem', height: '1.375rem' },
  lg: { width: '1.625rem', height: '1.625rem' },
});

export const checkboxIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'currentColor',
  lineHeight: 0,
  animation: `${popIn} ${vars.duration.fast} cubic-bezier(0.2, 0.9, 0.3, 1.4)`,
});

/** Colour override per scheme — only solid/checked state needs re-colouring. */
export const checkboxColorScheme = styleVariants({
  accent: {
    selectors: {
      '&[data-state="checked"], &[data-state="indeterminate"]': {
        background: vars.color.accent.solid,
        borderColor: vars.color.accent.solid,
      },
    },
  },
  success: {
    selectors: {
      '&[data-state="checked"], &[data-state="indeterminate"]': {
        background: vars.color.feedback.success.solid,
        borderColor: vars.color.feedback.success.solid,
      },
    },
  },
  danger: {
    selectors: {
      '&[data-state="checked"], &[data-state="indeterminate"]': {
        background: vars.color.feedback.danger.solid,
        borderColor: vars.color.feedback.danger.solid,
      },
    },
  },
  neutral: {
    selectors: {
      '&[data-state="checked"], &[data-state="indeterminate"]': {
        background: vars.color.foreground.default,
        borderColor: vars.color.foreground.default,
      },
    },
  },
});
