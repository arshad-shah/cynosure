import { createVar, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const solidVar = createVar();
const solidTopVar = createVar();

export const circularProgressRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  vars: {
    [solidVar]: vars.color.accent.solid,
    [solidTopVar]: `color-mix(in oklab, ${vars.color.accent.solid} 82%, white)`,
  },
});

export const circularProgressSize = styleVariants({
  xs: { width: '1.5rem', height: '1.5rem' },
  sm: { width: '2rem', height: '2rem' },
  md: { width: '3rem', height: '3rem' },
  lg: { width: '4rem', height: '4rem' },
  xl: { width: '5rem', height: '5rem' },
});

const indeterminateRotate = keyframes({
  from: { transform: 'rotate(-90deg)' },
  to: { transform: 'rotate(270deg)' },
});

export const circularProgressSvg = style({
  width: '100%',
  height: '100%',
  transform: 'rotate(-90deg)',
  overflow: 'visible',
});

export const circularProgressSvgIndeterminate = style({
  animationName: indeterminateRotate,
  animationDuration: '1.2s',
  animationIterationCount: 'infinite',
  animationTimingFunction: vars.easing.linear,
  transformOrigin: 'center',
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

/** The recessed ring — paints the "well" that the indicator stroke lives in. */
export const circularProgressTrack = style({
  fill: 'none',
  stroke: vars.color.background.subtle,
});

/**
 * The indicator ring. Stroke colour is the scheme's solid; the gradient and
 * glow moves from the linear bar aren't practical on thin strokes so we lean
 * on `stroke-linecap: round` and a soft drop-shadow to lift it off the track.
 */
export const circularProgressIndicator = style({
  fill: 'none',
  stroke: solidVar,
  strokeLinecap: 'round',
  filter: `drop-shadow(0 0 2px color-mix(in oklab, ${solidVar} 35%, transparent))`,
  transition: `stroke-dashoffset ${vars.duration.slow} ${vars.easing.easeOut}, stroke ${vars.duration.normal} ${vars.easing.easeInOut}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

const schemeVars = (base: string): { vars: Record<string, string> } => ({
  vars: {
    [solidVar]: base,
    [solidTopVar]: `color-mix(in oklab, ${base} 82%, white)`,
  },
});

export const circularProgressColorAccent = style(schemeVars(vars.color.accent.solid));
export const circularProgressColorSuccess = style(schemeVars(vars.color.feedback.success.solid));
export const circularProgressColorWarning = style(schemeVars(vars.color.feedback.warning.solid));
export const circularProgressColorDanger = style(schemeVars(vars.color.feedback.danger.solid));
export const circularProgressColorNeutral = style(schemeVars(vars.color.foreground.muted));

export const circularProgressLabel = style({
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  fontWeight: 600,
  fontSize: vars.font.body.sm.size,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.foreground.default,
});
