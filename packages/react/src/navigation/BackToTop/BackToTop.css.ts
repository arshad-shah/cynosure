import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const backToTopButton = style({
  position: 'fixed',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  padding: 0,
  border: 'none',
  background: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.lg,
  cursor: 'pointer',
  transitionProperty: 'opacity, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  zIndex: Number(vars.z.sticky),
  opacity: 1,
  transform: 'translateY(0)',
  selectors: {
    '&[data-visible="false"]': {
      opacity: 0,
      transform: 'translateY(12px)',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: vars.color.accent.solidHover,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `${vars.shadow.lg}, ${focusRing}`,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const backToTopPosition = styleVariants({
  'bottom-right': {
    bottom: vars.space['6'],
    right: vars.space['6'],
  },
  'bottom-left': {
    bottom: vars.space['6'],
    left: vars.space['6'],
  },
  'bottom-center': {
    bottom: vars.space['6'],
    left: '50%',
    transform: 'translateX(-50%)',
  },
});
