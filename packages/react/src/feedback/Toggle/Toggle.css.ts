import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const toggleRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['1.5'],
  padding: 0,
  background: 'transparent',
  color: vars.color.foreground.default,
  border: '1px solid transparent',
  borderRadius: vars.radius.md,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 'var(--cynosure-font-weight-medium)',
  lineHeight: 1,
  cursor: 'pointer',
  userSelect: 'none',
  transitionProperty: 'background-color, color, border-color, box-shadow',
  transitionDuration: vars.duration.fast,
  outline: 'none',
  selectors: {
    '&:hover': { background: vars.color.background.muted },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-state="on"]': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solid,
    },
    '&:disabled, &[aria-disabled="true"]': {
      opacity: 0.55,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const toggleVariantOutline = style({
  borderColor: vars.color.border.default,
  selectors: {
    '&[data-state="on"]': {
      background: vars.color.accent.soft,
      borderColor: vars.color.accent.solid,
      color: vars.color.accent.solid,
    },
  },
});

export const toggleVariantSolid = style({
  background: vars.color.background.muted,
  selectors: {
    '&[data-state="on"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
  },
});

export const toggleSize = styleVariants({
  xs: {
    minHeight: '1.5rem',
    paddingInline: vars.space['1.5'],
    fontSize: 'var(--cynosure-font-body-xs-size)',
  },
  sm: {
    minHeight: '2rem',
    paddingInline: vars.space['2'],
    fontSize: 'var(--cynosure-font-body-sm-size)',
  },
  md: {
    minHeight: '2.5rem',
    paddingInline: vars.space['3'],
    fontSize: 'var(--cynosure-font-body-md-size)',
  },
  lg: {
    minHeight: '3rem',
    paddingInline: vars.space['4'],
    fontSize: 'var(--cynosure-font-body-lg-size)',
  },
});

// ToggleGroup wrapper.
export const toggleGroupRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['0.5'],
  background: 'transparent',
  selectors: {
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
});

export const toggleGroupAttached = style({
  gap: 0,
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: 0,
});

globalStyle(`${toggleGroupAttached} ${toggleRoot}`, {
  borderRadius: 0,
  border: 'none',
  borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
});

globalStyle(`${toggleGroupAttached} ${toggleRoot}:last-child`, {
  borderInlineEnd: 'none',
});

globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}`, {
  borderInlineEnd: 'none',
  borderBlockEnd: `1px solid ${vars.color.border.subtle}`,
});

globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}:last-child`, {
  borderBlockEnd: 'none',
});
