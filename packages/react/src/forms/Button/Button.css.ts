import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const spin = keyframes({
  from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
  to: { transform: 'translate(-50%, -50%) rotate(360deg)' },
});

/**
 * Button base. Paints layout/typography/focus but no colour surface — that
 * comes from `buttonVariant × buttonColorScheme` combinations.
 */
export const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['2'],
  border: '1px solid transparent',
  borderRadius: vars.radius.md,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 'var(--cynosure-font-weight-medium)',
  lineHeight: 1,
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  transitionProperty: 'background-color, border-color, color, box-shadow, opacity, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  outline: 'none',
  selectors: {
    '&:hover:not(:disabled):not([aria-disabled="true"]):not([data-loading="true"])': {
      transform: 'translateY(-1px)',
    },
    '&:active:not(:disabled):not([aria-disabled="true"]):not([data-loading="true"])': {
      transform: 'translateY(0) scale(0.97)',
      transitionDuration: vars.duration.instant,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&:disabled, &[aria-disabled="true"], &[data-loading="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionProperty: 'background-color, border-color, color, box-shadow, opacity',
    },
  },
});

// Hide the content when loading so width stays stable for the spinner.
globalStyle(`${buttonBase}[data-loading="true"] > [data-slot="content"]`, {
  opacity: 0,
});

export const buttonSize = styleVariants({
  xs: {
    minHeight: '1.5rem',
    paddingInline: vars.space['2'],
    fontSize: 'var(--cynosure-font-body-xs-size)',
    borderRadius: vars.radius.sm,
  },
  sm: {
    minHeight: '2rem',
    paddingInline: vars.space['3'],
    fontSize: 'var(--cynosure-font-body-sm-size)',
    borderRadius: vars.radius.sm,
  },
  md: {
    minHeight: '2.5rem',
    paddingInline: vars.space['4'],
    fontSize: 'var(--cynosure-font-body-md-size)',
  },
  lg: {
    minHeight: '3rem',
    paddingInline: vars.space['5'],
    fontSize: 'var(--cynosure-font-body-lg-size)',
  },
  xl: {
    minHeight: '3.5rem',
    paddingInline: vars.space['6'],
    fontSize: 'var(--cynosure-font-body-lg-size)',
  },
});

export const buttonShape = styleVariants({
  default: {},
  square: {
    paddingInline: 0,
    aspectRatio: '1 / 1',
  },
  pill: {
    borderRadius: vars.radius.full,
  },
});

/**
 * Variant × colourScheme is intentionally flat: each combination writes its
 * own colour surfaces so the specificity stays obvious. Solid + accent drives
 * the flagship "primary action" look; soft/outline/ghost/link tune down.
 *
 * Colours come from the semantic tokens, so dark / high-contrast themes
 * automatically re-colour every button.
 */

// --- SOLID -----------------------------------------------------------------
export const solidAccent = style({
  background: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.solidHover,
    },
    '&:active:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.solidActive,
    },
  },
});

export const solidNeutral = style({
  background: vars.color.foreground.default,
  color: vars.color.background.surface,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      opacity: 0.9,
    },
  },
});

export const solidSuccess = style({
  background: vars.color.feedback.success.solid,
  color: vars.color.feedback.success.onSolid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      filter: 'brightness(0.95)',
    },
  },
});

export const solidDanger = style({
  background: vars.color.feedback.danger.solid,
  color: vars.color.feedback.danger.onSolid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      filter: 'brightness(0.95)',
    },
  },
});

export const solidWarning = style({
  background: vars.color.feedback.warning.solid,
  color: vars.color.feedback.warning.onSolid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      filter: 'brightness(0.95)',
    },
  },
});

// --- SOFT ------------------------------------------------------------------
export const softAccent = style({
  background: vars.color.accent.soft,
  color: vars.color.accent.solid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.softHover,
    },
    '&:active:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.softActive,
    },
  },
});

export const softNeutral = style({
  background: vars.color.background.muted,
  color: vars.color.foreground.default,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.background.subtle,
    },
  },
});

export const softSuccess = style({
  background: vars.color.feedback.success.soft,
  color: vars.color.feedback.success.solid,
});

export const softDanger = style({
  background: vars.color.feedback.danger.soft,
  color: vars.color.feedback.danger.solid,
});

export const softWarning = style({
  background: vars.color.feedback.warning.soft,
  color: vars.color.feedback.warning.solid,
});

// --- OUTLINE ---------------------------------------------------------------
export const outlineAccent = style({
  background: 'transparent',
  color: vars.color.accent.solid,
  borderColor: vars.color.accent.solid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.soft,
    },
  },
});

export const outlineNeutral = style({
  background: 'transparent',
  color: vars.color.foreground.default,
  borderColor: vars.color.border.default,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.background.subtle,
      borderColor: vars.color.border.strong,
    },
  },
});

export const outlineSuccess = style({
  background: 'transparent',
  color: vars.color.feedback.success.solid,
  borderColor: vars.color.feedback.success.border,
});

export const outlineDanger = style({
  background: 'transparent',
  color: vars.color.feedback.danger.solid,
  borderColor: vars.color.feedback.danger.border,
});

export const outlineWarning = style({
  background: 'transparent',
  color: vars.color.feedback.warning.solid,
  borderColor: vars.color.feedback.warning.border,
});

// --- GHOST -----------------------------------------------------------------
export const ghostAccent = style({
  background: 'transparent',
  color: vars.color.accent.solid,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.accent.soft,
    },
  },
});

export const ghostNeutral = style({
  background: 'transparent',
  color: vars.color.foreground.default,
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      background: vars.color.background.subtle,
    },
  },
});

export const ghostSuccess = style({
  background: 'transparent',
  color: vars.color.feedback.success.solid,
});

export const ghostDanger = style({
  background: 'transparent',
  color: vars.color.feedback.danger.solid,
});

export const ghostWarning = style({
  background: 'transparent',
  color: vars.color.feedback.warning.solid,
});

// --- LINK ------------------------------------------------------------------
export const linkVariant = style({
  background: 'transparent',
  borderColor: 'transparent',
  minHeight: 0,
  paddingInline: 0,
  textDecorationLine: 'underline',
  textUnderlineOffset: '0.15em',
  selectors: {
    '&:hover:not(:disabled):not([data-loading="true"])': {
      textDecorationThickness: '2px',
      transform: 'none',
    },
    '&:active:not(:disabled):not([data-loading="true"])': {
      transform: 'none',
    },
  },
});

export const linkAccent = style([
  linkVariant,
  {
    color: vars.color.accent.solid,
  },
]);

export const linkNeutral = style([
  linkVariant,
  {
    color: vars.color.foreground.default,
  },
]);

export const linkSuccess = style([
  linkVariant,
  {
    color: vars.color.feedback.success.solid,
  },
]);

export const linkDanger = style([
  linkVariant,
  {
    color: vars.color.feedback.danger.solid,
  },
]);

export const linkWarning = style([
  linkVariant,
  {
    color: vars.color.feedback.warning.solid,
  },
]);

export const buttonFullWidth = style({ width: '100%' });

/**
 * Spinner sits absolutely-centred on top of the content (which gets
 * `opacity: 0` while loading). That keeps the button's width stable so the
 * layout doesn't jump when toggling `loading`.
 */
export const buttonSpinner = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '1em',
  height: '1em',
  borderRadius: vars.radius.full,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  animation: `${spin} 0.8s linear infinite`,
});

export const buttonContent = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['2'],
});
