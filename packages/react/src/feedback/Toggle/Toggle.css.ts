import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
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
      boxShadow: focusRing,
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

// Round the outer corners of the end items so a selected item's fill follows
// the group's rounded border instead of poking square corners past it. We
// round the items rather than clipping the wrapper with `overflow: hidden`,
// which would crop the items' focus-ring box-shadow. The inner radius is the
// wrapper radius minus its 1px border so the corner nests exactly.
const attachedRadius = `calc(${vars.radius.md} - 1px)`;

// Horizontal (default): first item rounds its leading edge, last its trailing.
globalStyle(`${toggleGroupAttached} ${toggleRoot}:first-child`, {
  borderStartStartRadius: attachedRadius,
  borderEndStartRadius: attachedRadius,
});

globalStyle(`${toggleGroupAttached} ${toggleRoot}:last-child`, {
  borderStartEndRadius: attachedRadius,
  borderEndEndRadius: attachedRadius,
});

globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}`, {
  borderInlineEnd: 'none',
  borderBlockEnd: `1px solid ${vars.color.border.subtle}`,
});

globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}:last-child`, {
  borderBlockEnd: 'none',
});

// Vertical: first item rounds its top edge, last its bottom edge — and the
// inline-axis corners the horizontal rules set above are reset to 0.
globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}:first-child`, {
  borderStartStartRadius: attachedRadius,
  borderStartEndRadius: attachedRadius,
  borderEndStartRadius: 0,
});

globalStyle(`${toggleGroupAttached}[data-orientation="vertical"] ${toggleRoot}:last-child`, {
  borderEndStartRadius: attachedRadius,
  borderEndEndRadius: attachedRadius,
  borderStartEndRadius: 0,
});
