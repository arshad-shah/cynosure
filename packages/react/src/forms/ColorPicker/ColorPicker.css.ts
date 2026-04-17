import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  padding: vars.space['1'],
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  cursor: 'pointer',
  color: vars.color.foreground.default,
  outline: 'none',
  selectors: {
    '&:focus-visible': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const swatch = style({
  display: 'inline-block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border.subtle}`,
});

export const contentWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  padding: vars.space['3'],
  width: '16rem',
});

export const area = style({
  position: 'relative',
  width: '100%',
  height: '10rem',
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  touchAction: 'none',
});

export const areaThumb = style({
  width: '0.75rem',
  height: '0.75rem',
  border: '2px solid white',
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.default}`,
  outline: 'none',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const slider = style({
  position: 'relative',
  width: '100%',
  height: '0.75rem',
  borderRadius: vars.radius.full,
  touchAction: 'none',
});

export const sliderThumb = style({
  width: '1rem',
  height: '1rem',
  border: '2px solid white',
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.default}`,
  background: 'transparent',
  outline: 'none',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const field = style({
  width: '100%',
  padding: `${vars.space['1.5']} ${vars.space['2']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  font: 'inherit',
  fontFamily: 'var(--lumen-font-body-md-family)',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
