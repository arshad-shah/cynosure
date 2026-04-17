import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

const dotPulse = keyframes({
  '0%, 80%, 100%': { transform: 'scale(0)', opacity: 0.3 },
  '40%': { transform: 'scale(1)', opacity: 1 },
});

export const spinnerRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
  color: 'currentColor',
});

export const spinnerSize = styleVariants({
  xs: { width: '0.75rem', height: '0.75rem' },
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.25rem', height: '1.25rem' },
  lg: { width: '1.75rem', height: '1.75rem' },
  xl: { width: '2.5rem', height: '2.5rem' },
});

export const spinnerColorAccent = style({ color: vars.color.accent.solid });
export const spinnerColorNeutral = style({ color: vars.color.foreground.muted });
export const spinnerColorCurrent = style({ color: 'currentColor' });

export const spinnerBorder = style({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  animationName: spin,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 0.6,
    },
  },
});

export const spinnerRing = style({
  width: '100%',
  height: '100%',
});

export const spinnerRingCircleTrack = style({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  opacity: 0.2,
});

export const spinnerRingCircleProgress = style({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeDasharray: '60 120',
  transformOrigin: 'center',
  animationName: spin,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const spinnerDots = style({
  display: 'inline-flex',
  gap: '20%',
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
});

export const spinnerDot = style({
  width: '25%',
  height: '25%',
  borderRadius: '50%',
  background: 'currentColor',
  animationName: dotPulse,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const speedSlow = style({ animationDuration: '1.4s' });
export const speedNormal = style({ animationDuration: '0.8s' });
export const speedFast = style({ animationDuration: '0.4s' });
