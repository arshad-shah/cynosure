import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const pulse = keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.5 },
  '100%': { opacity: 1 },
});

const wave = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

export const skeletonBase = style({
  display: 'block',
  background: vars.color.background.muted,
  borderRadius: vars.radius.sm,
  position: 'relative',
  overflow: 'hidden',
});

export const skeletonVariantText = style({
  borderRadius: vars.radius.sm,
  height: '1em',
});

export const skeletonVariantRect = style({
  borderRadius: vars.radius.sm,
});

export const skeletonVariantCircle = style({
  borderRadius: vars.radius.full,
});

export const skeletonAnimationPulse = style({
  animationName: pulse,
  animationDuration: '1.6s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const skeletonAnimationWave = style({
  background: `linear-gradient(90deg, ${vars.color.background.muted} 0%, ${vars.color.background.subtle} 50%, ${vars.color.background.muted} 100%)`,
  backgroundSize: '200% 100%',
  animationName: wave,
  animationDuration: '1.6s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      background: vars.color.background.muted,
    },
  },
});

export const skeletonVariant = styleVariants({
  text: [skeletonVariantText],
  rect: [skeletonVariantRect],
  circle: [skeletonVariantCircle],
});
