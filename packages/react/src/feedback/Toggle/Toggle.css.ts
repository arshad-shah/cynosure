import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { segmentedTrack } from '../../forms/shared/segmented.css.js';
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
  fontFamily: vars.font.body.md.family,
  fontWeight: vars.font.weight.medium,
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
    fontSize: vars.font.body.xs.size,
  },
  sm: {
    minHeight: '2rem',
    paddingInline: vars.space['2'],
    fontSize: vars.font.body.sm.size,
  },
  md: {
    minHeight: '2.5rem',
    paddingInline: vars.space['3'],
    fontSize: vars.font.body.md.size,
  },
  lg: {
    minHeight: '3rem',
    paddingInline: vars.space['4'],
    fontSize: vars.font.body.lg.size,
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

/**
 * Attached mode — the shared segmented-track container (tinted `subtle` well,
 * hairline border, 4px padding/gap) that `NumberInput` and `ButtonGroup`
 * also use, so every segmented control reads the same. `gap` and `background`
 * are re-asserted because `toggleGroupRoot` (declared above, later in the
 * cascade than the shared recipe) would otherwise win with its own values.
 */
export const toggleGroupAttached = style([
  segmentedTrack,
  {
    gap: vars.space['1'],
    background: vars.color.background.subtle,
  },
]);

// Items float inside the track as tiles: flat at rest, raised when selected.
// The descendant selector (0,3,0 with the attribute) outweighs the item's own
// variant rules, so attached items render consistently across `ghost` /
// `outline` / `solid` item variants.
globalStyle(`${toggleGroupAttached} ${toggleRoot}`, {
  border: 'none',
});

globalStyle(`${toggleGroupAttached} ${toggleRoot}[data-state="on"]`, {
  background: vars.color.background.raised,
  boxShadow: vars.shadow.xs,
  color: vars.color.accent.solid,
});
