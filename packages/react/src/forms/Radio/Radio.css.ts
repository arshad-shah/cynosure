import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

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
      opacity: 0.6,
    },
  },
});

export const radioRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.full,
  color: vars.color.accent.solid,
  transitionProperty: 'background-color, border-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-state="checked"]': {
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
  },
});

export const radioSize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.125rem', height: '1.125rem' },
  lg: { width: '1.375rem', height: '1.375rem' },
});

export const radioIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  selectors: {
    '&::after': {
      content: '""',
      display: 'block',
      width: '55%',
      height: '55%',
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
