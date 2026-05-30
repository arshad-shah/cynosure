import { createVar, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Per-scheme indicator colour. Set on the root via `--linear-progress-solid`
 * and friends, then consumed by the indicator gradient + glow. Keeps the
 * gradient formula in one place instead of duplicated per scheme.
 */
const solidVar = createVar();
const solidTopVar = createVar();
const glowVar = createVar();

export const linearProgressRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1.5'],
  width: '100%',
  vars: {
    [solidVar]: vars.color.accent.solid,
    [solidTopVar]: `color-mix(in oklab, ${vars.color.accent.solid} 82%, white)`,
    [glowVar]: `color-mix(in oklab, ${vars.color.accent.solid} 35%, transparent)`,
  },
});

export const linearProgressHeader = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.space['3'],
  fontSize: 'var(--cynosure-font-body-sm-size)',
  lineHeight: 'var(--cynosure-font-body-sm-line-height)',
});

export const linearProgressLabel = style({
  color: vars.color.foreground.default,
  fontWeight: 500,
});

export const linearProgressMeta = style({
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

/**
 * The track — a punched-card well. A deeper inset shadow than the form
 * controls' fields (the track is decorative, not an interactive surface, so
 * it reads as "recessed" rather than "ready for input").
 */
export const linearProgressTrack = style({
  position: 'relative',
  display: 'flex',
  width: '100%',
  overflow: 'hidden',
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.full,
  boxShadow: `
    inset 0 1px 3px color-mix(in oklab, ${vars.color.foreground.default} 14%, transparent),
    inset 0 -1px 0 rgba(255,255,255,0.02)
  `,
});

export const linearProgressTrackSize = styleVariants({
  xs: { height: '0.25rem' },
  sm: { height: '0.5rem' },
  md: { height: '0.75rem' },
  lg: { height: '1rem' },
});

/** Opt-in tick-marks variant — the literal punch-card motif. */
export const linearProgressTrackTicked = style({
  backgroundImage: `linear-gradient(
    90deg,
    color-mix(in oklab, ${vars.color.foreground.default} 14%, transparent) 1px,
    transparent 1px
  )`,
  backgroundSize: '10% 100%',
  backgroundRepeat: 'repeat-x',
  backgroundPosition: '0 0',
});

const indicatorGradient = `linear-gradient(180deg, ${solidTopVar} 0%, ${solidVar} 100%)`;

/**
 * The indicator — lifted off the well with a soft inner gloss and glow.
 * Uses `scaleX` from a left origin so the width animates without triggering
 * layout. RTL flips the transform origin so growth visually reads left-to-end.
 */
export const linearProgressIndicator = style({
  position: 'absolute',
  insetBlock: 0,
  insetInlineStart: 0,
  width: '100%',
  height: '100%',
  borderRadius: vars.radius.full,
  background: indicatorGradient,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 -1px 0 rgba(0,0,0,0.12),
    0 1px 2px ${glowVar}
  `,
  transformOrigin: 'left center',
  transition: `transform ${vars.duration.slow} ${vars.easing.easeOut}`,
  zIndex: 2,
  selectors: {
    '[dir="rtl"] &': { transformOrigin: 'right center' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

/** Subtle pulse on the completion state — respects reduced-motion. */
const completePulse = keyframes({
  '0%, 100%': { boxShadow: `0 0 0 0 ${glowVar}` },
  '50%': { boxShadow: `0 0 0 3px ${glowVar}` },
});

export const linearProgressIndicatorComplete = style({
  animationName: completePulse,
  animationDuration: '1.8s',
  animationIterationCount: 2,
  animationTimingFunction: vars.easing.easeOut,
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

/**
 * Buffer — rendered behind the indicator. Same gradient at reduced opacity so
 * it still reads as "reserved progress" rather than a separate element.
 */
export const linearProgressBuffer = style({
  position: 'absolute',
  insetBlock: 0,
  insetInlineStart: 0,
  width: '100%',
  height: '100%',
  borderRadius: vars.radius.full,
  background: indicatorGradient,
  opacity: 0.28,
  transformOrigin: 'left center',
  transition: `transform ${vars.duration.slow} ${vars.easing.easeOut}`,
  zIndex: 1,
  selectors: {
    '[dir="rtl"] &': { transformOrigin: 'right center' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

/**
 * Stacked-bar segment. Sits inline in the track (flex layout), so width
 * translates to flex-basis — gradient + gloss still apply, glow stays off
 * because adjacent segments would bleed into each other's halos.
 */
export const linearProgressSegment = style({
  position: 'relative',
  height: '100%',
  minWidth: 0,
  background: indicatorGradient,
  transition: `flex-basis ${vars.duration.slow} ${vars.easing.easeOut}`,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 -1px 0 rgba(0,0,0,0.12)
  `,
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  selectors: {
    '&:first-child': {
      borderStartStartRadius: vars.radius.full,
      borderEndStartRadius: vars.radius.full,
    },
    '&:last-child': {
      borderStartEndRadius: vars.radius.full,
      borderEndEndRadius: vars.radius.full,
    },
  },
});

/* Per-scheme colour overrides — set the three custom properties. */
const scheme = (base: string): { vars: Record<string, string> } => ({
  vars: {
    [solidVar]: base,
    [solidTopVar]: `color-mix(in oklab, ${base} 82%, white)`,
    [glowVar]: `color-mix(in oklab, ${base} 35%, transparent)`,
  },
});

export const linearProgressColorAccent = style(scheme(vars.color.accent.solid));
export const linearProgressColorSuccess = style(scheme(vars.color.feedback.success.solid));
export const linearProgressColorWarning = style(scheme(vars.color.feedback.warning.solid));
export const linearProgressColorDanger = style(scheme(vars.color.feedback.danger.solid));
export const linearProgressColorNeutral = style(scheme(vars.color.foreground.muted));

/* ---------- Indeterminate (MUI-style two-bar asymmetric motion) ---------- */

const indeterminate1 = keyframes({
  '0%': { insetInlineStart: '-35%', width: '35%' },
  '60%': { insetInlineStart: '100%', width: '35%' },
  '100%': { insetInlineStart: '100%', width: '35%' },
});

const indeterminate2 = keyframes({
  '0%': { insetInlineStart: '-100%', width: '100%' },
  '60%': { insetInlineStart: '107%', width: '10%' },
  '100%': { insetInlineStart: '107%', width: '10%' },
});

export const linearProgressIndeterminate = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

const indeterminateBarBase = style({
  position: 'absolute',
  insetBlock: 0,
  borderRadius: vars.radius.full,
  background: indicatorGradient,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      insetInlineStart: 0,
      width: '100%',
      opacity: 0.4,
    },
  },
});

export const linearProgressIndeterminateBar1 = style([
  indeterminateBarBase,
  {
    animationName: indeterminate1,
    animationDuration: '2.1s',
    animationTimingFunction: vars.easing.easeIn,
    animationIterationCount: 'infinite',
  },
]);

export const linearProgressIndeterminateBar2 = style([
  indeterminateBarBase,
  {
    animationName: indeterminate2,
    animationDuration: '2.1s',
    animationTimingFunction: vars.easing.easeOut,
    animationIterationCount: 'infinite',
    animationDelay: '1.15s',
  },
]);

/* ---------- Value readout ---------- */

export const linearProgressValue = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.default,
  fontVariantNumeric: 'tabular-nums',
  alignSelf: 'flex-end',
});

export const linearProgressValueComplete = style({
  color: vars.color.feedback.success.foreground,
});
