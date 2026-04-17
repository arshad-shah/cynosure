import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

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
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.xs,
  color: vars.color.accent.onSolid,
  transitionProperty: 'background-color, border-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-state="checked"], &[data-state="indeterminate"]': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
});

export const checkboxSize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.125rem', height: '1.125rem' },
  lg: { width: '1.375rem', height: '1.375rem' },
});

export const checkboxIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: 'currentColor',
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
