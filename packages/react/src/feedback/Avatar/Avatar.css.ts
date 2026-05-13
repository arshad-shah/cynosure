import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/*
 * Avatar root deliberately does NOT clip its overflow. The status dot lives
 * inside the root as an absolutely-positioned child anchored to the bounding
 * box corner; with `overflow: hidden` here, the rounded-corner shape would
 * clip the dot (and its 2px halo) almost entirely — only a thin sliver
 * remained visible where the dot intersected the circle. The image and
 * fallback children carry their own clipping below.
 */
export const avatarRoot = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  userSelect: 'none',
  verticalAlign: 'middle',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 'var(--cynosure-font-weight-medium)',
  background: vars.color.background.muted,
  color: vars.color.foreground.default,
});

export const avatarSize = styleVariants({
  xs: { width: '1.25rem', height: '1.25rem', fontSize: '0.625rem' },
  sm: { width: '1.5rem', height: '1.5rem', fontSize: '0.75rem' },
  md: { width: '2rem', height: '2rem', fontSize: '0.8125rem' },
  lg: { width: '2.5rem', height: '2.5rem', fontSize: '0.9375rem' },
  xl: { width: '3.5rem', height: '3.5rem', fontSize: '1.125rem' },
  '2xl': { width: '4.5rem', height: '4.5rem', fontSize: '1.5rem' },
});

export const avatarShape = styleVariants({
  circle: { borderRadius: vars.radius.full },
  square: { borderRadius: vars.radius.none },
  rounded: { borderRadius: vars.radius.md },
});

export const avatarRing = style({
  boxShadow: `0 0 0 2px ${vars.color.background.surface}`,
});

export const avatarImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

export const avatarFallback = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
});

export const avatarStatus = style({
  position: 'absolute',
  width: '28%',
  height: '28%',
  minWidth: '0.5rem',
  minHeight: '0.5rem',
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 2px ${vars.color.background.surface}`,
  pointerEvents: 'none',
});

export const avatarStatusPosition = styleVariants({
  'top-right': { top: 0, right: 0 },
  'bottom-right': { bottom: 0, right: 0 },
});

export const avatarStatusColor = styleVariants({
  online: { background: vars.color.feedback.success.solid },
  offline: { background: vars.color.foreground.muted },
  away: { background: vars.color.feedback.warning.solid },
  busy: { background: vars.color.feedback.danger.solid },
});

// Derived background palette for initial-colour hash.
export const avatarPalette = styleVariants({
  red: {
    background: vars.color.feedback.danger.soft,
    color: vars.color.feedback.danger.foreground,
  },
  amber: {
    background: vars.color.feedback.warning.soft,
    color: vars.color.feedback.warning.foreground,
  },
  green: {
    background: vars.color.feedback.success.soft,
    color: vars.color.feedback.success.foreground,
  },
  blue: { background: vars.color.feedback.info.soft, color: vars.color.feedback.info.foreground },
  violet: { background: vars.color.accent.soft, color: vars.color.accent.solid },
  pink: {
    background: vars.color.feedback.danger.soft,
    color: vars.color.feedback.danger.foreground,
  },
  teal: { background: vars.color.feedback.info.soft, color: vars.color.feedback.info.foreground },
  orange: {
    background: vars.color.feedback.warning.soft,
    color: vars.color.feedback.warning.foreground,
  },
});

// AvatarGroup wrapper — stacked overlap.
export const avatarGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  isolation: 'isolate',
});

export const avatarGroupItem = style({
  marginInlineStart: `calc(${vars.space['2']} * -1)`,
  selectors: {
    '&:first-child': { marginInlineStart: 0 },
  },
});

export const avatarOverflow = style({
  background: vars.color.background.muted,
  color: vars.color.foreground.muted,
});
