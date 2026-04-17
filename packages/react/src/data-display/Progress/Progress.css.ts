import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const indeterminateSlide = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(250%)' },
});

const stripedMove = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '100%': { backgroundPosition: '1rem 0' },
});

export const progressRoot = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  width: '100%',
});

export const progressTrack = style({
  flex: '1 1 auto',
  position: 'relative',
  overflow: 'hidden',
  background: vars.color.background.muted,
  borderRadius: vars.radius.full,
});

export const progressTrackSize = styleVariants({
  xs: { height: '0.25rem' },
  sm: { height: '0.5rem' },
  md: { height: '0.75rem' },
  lg: { height: '1rem' },
});

export const progressIndicator = style({
  height: '100%',
  width: '100%',
  borderRadius: vars.radius.full,
  transition: `transform ${vars.duration.normal} ease`,
  transformOrigin: 'left',
  selectors: {
    '[dir="rtl"] &': {
      transformOrigin: 'right',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const progressColorAccent = style({ background: vars.color.accent.solid });
export const progressColorSuccess = style({ background: vars.color.feedback.success.solid });
export const progressColorWarning = style({ background: vars.color.feedback.warning.solid });
export const progressColorDanger = style({ background: vars.color.feedback.danger.solid });
export const progressColorNeutral = style({ background: vars.color.foreground.muted });

export const progressStriped = style({
  backgroundImage:
    'linear-gradient(45deg, rgba(255,255,255,0.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.18) 75%, transparent 75%, transparent)',
  backgroundSize: '1rem 1rem',
});

export const progressStripedAnimated = style({
  animationName: stripedMove,
  animationDuration: '1s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const progressIndeterminateIndicator = style({
  position: 'absolute',
  inset: 0,
  width: '40%',
  borderRadius: vars.radius.full,
  animationName: indeterminateSlide,
  animationDuration: '1.4s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      width: '100%',
      opacity: 0.4,
    },
  },
});

export const progressValueLabel = style({
  fontSize: 'var(--lumen-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
  minWidth: '3ch',
  textAlign: 'right',
});

/* ProgressCircle */
export const circleRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const circleSize = styleVariants({
  xs: { width: '1.5rem', height: '1.5rem' },
  sm: { width: '2rem', height: '2rem' },
  md: { width: '3rem', height: '3rem' },
  lg: { width: '4rem', height: '4rem' },
  xl: { width: '5rem', height: '5rem' },
});

export const circleSvg = style({
  width: '100%',
  height: '100%',
  transform: 'rotate(-90deg)',
});

export const circleTrack = style({
  fill: 'none',
  stroke: vars.color.background.muted,
});

export const circleProgress = style({
  fill: 'none',
  strokeLinecap: 'round',
  transition: `stroke-dashoffset ${vars.duration.normal} ease`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

const indeterminateRotate = keyframes({
  to: { transform: 'rotate(270deg)' },
});

export const circleSvgIndeterminate = style({
  animationName: indeterminateRotate,
  animationDuration: '1.4s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const circleContent = style({
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
});
