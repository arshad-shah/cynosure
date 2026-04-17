import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const popIn = keyframes({
  '0%': { transform: 'scale(0)', opacity: 0 },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

export const radioLabel = style({
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
      opacity: 0.5,
    },
  },
});

export const radioRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: vars.color.background.surface,
  border: `1.5px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.full,
  color: vars.color.accent.onSolid,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow, transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover:not([data-disabled]):not([data-state="checked"])': {
      borderColor: vars.color.accent.solid,
      background: vars.color.background.raised,
    },
    '&[data-state="checked"]': {
      borderColor: vars.color.accent.solid,
      background: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${vars.color.accent.ring}`,
    },
    '&:active:not([data-disabled])': {
      transform: 'scale(0.94)',
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-disabled]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const radioSize = styleVariants({
  sm: {
    width: '1.125rem',
    height: '1.125rem',
    vars: { '--lumen-radio-dot-size': '0.5rem' },
  },
  md: {
    width: '1.375rem',
    height: '1.375rem',
    vars: { '--lumen-radio-dot-size': '0.625rem' },
  },
  lg: {
    width: '1.625rem',
    height: '1.625rem',
    vars: { '--lumen-radio-dot-size': '0.75rem' },
  },
});

export const radioIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
  animation: `${popIn} ${vars.duration.fast} cubic-bezier(0.2, 0.9, 0.3, 1.4)`,
  selectors: {
    '&::after': {
      content: '""',
      display: 'block',
      width: 'var(--lumen-radio-dot-size, 0.625rem)',
      height: 'var(--lumen-radio-dot-size, 0.625rem)',
      borderRadius: vars.radius.full,
      background: 'currentColor',
    },
  },
});

export const radioGroupRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
});

export const radioGroupHorizontal = style({
  flexDirection: 'row',
  gap: vars.space['4'],
});
