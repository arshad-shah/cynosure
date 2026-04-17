import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const tagInteractive = style({
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&:hover': {
      filter: 'brightness(0.97)',
    },
    '&:active': {
      transform: 'translateY(0.5px)',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const tagRemoveButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  background: 'transparent',
  border: 'none',
  padding: 0,
  marginInlineStart: vars.space['0.5'],
  marginInlineEnd: `calc(${vars.space['0.5']} * -1)`,
  borderRadius: vars.radius.full,
  color: 'inherit',
  cursor: 'pointer',
  opacity: 0.7,
  width: '1em',
  height: '1em',
  lineHeight: 0,
  transitionProperty: 'opacity, background-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': { opacity: 1, background: 'rgba(0,0,0,0.08)' },
    '&:focus-visible': {
      outline: 'none',
      opacity: 1,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const tagGroupTrigger = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  cursor: 'pointer',
  borderRadius: 'inherit',
  padding: 0,
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
