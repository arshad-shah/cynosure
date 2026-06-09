import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from './control.css.js';
import { segmentedTrack } from './segmented.css.js';

const danger = vars.color.feedback.danger.border;

/**
 * Shared **segmented trigger** for the dropdown controls (`Select`,
 * `Combobox`): the tinted track wraps a value tile and a separate chevron
 * tile, matching `NumberInput` / `Input`. The focus ring lives on the track.
 *
 * Works whether the track is a RAC `<Button>` (Select — keyboard focus shows
 * via `[data-focus-visible]`) or a `<div>` holding a focusable input (Combobox
 * — `:focus-within`). `data-variant` retints the track; `data-invalid` /
 * `data-disabled` mirror field state.
 */
export const triggerTrack = style([
  segmentedTrack,
  {
    width: '100%',
    cursor: 'default',
    textAlign: 'start',
    font: 'inherit',
    color: vars.color.foreground.default,
    selectors: {
      '&[data-variant="filled"]': {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      '&[data-variant="ghost"]': {
        background: 'transparent',
        borderColor: 'transparent',
      },
      '&[data-focus-visible]:not([data-invalid="true"]), &:focus-within:not([data-invalid="true"])':
        {
          borderColor: vars.color.border.focus,
          boxShadow: focusRing,
        },
      '&[data-invalid="true"]': { borderColor: danger },
      '&[data-invalid="true"][data-focus-visible], &[data-invalid="true"]:focus-within': {
        boxShadow: `0 0 0 2px ${danger}`,
      },
      '&[data-disabled="true"]': { opacity: 0.6, cursor: 'not-allowed' },
    },
  },
]);

/** Track font + outer radius per size (mirrors NumberInput's track scale). */
export const triggerTrackSize = styleVariants({
  sm: { borderRadius: vars.radius.md, fontSize: 'var(--cynosure-font-body-sm-size)' },
  md: { borderRadius: vars.radius.lg, fontSize: 'var(--cynosure-font-body-md-size)' },
  lg: { borderRadius: vars.radius.lg, fontSize: 'var(--cynosure-font-body-lg-size)' },
});

/** Base raised tile shared by the value and chevron segments. */
const triggerTile = style([
  fieldWellBase,
  {
    selectors: {
      // Ghost: tiles sit flat until the control is focused.
      [`${triggerTrack}[data-variant="ghost"] &`]: {
        background: 'transparent',
        boxShadow: 'none',
      },
      [`${triggerTrack}[data-variant="ghost"]:focus-within &, ${triggerTrack}[data-variant="ghost"][data-focus-visible] &`]:
        {
          background: vars.color.background.raised,
          boxShadow: vars.shadow.xs,
        },
      [`${triggerTrack}[data-invalid="true"] &`]: { borderColor: danger },
    },
  },
]);

/** The value tile — flexes to fill; truncates overflowing text. */
export const triggerValueTile = style([
  triggerTile,
  {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    paddingInline: vars.space['3'],
    cursor: 'inherit',
  },
]);

/** The chevron tile — fixed square, centered icon, rotates when open. */
export const triggerChevronTile = style([
  triggerTile,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    color: vars.color.foreground.muted,
    cursor: 'pointer',
    border: 'none',
    padding: 0,
    outline: 'none',
    selectors: {
      '&[data-hovered], &:hover': {
        background: vars.color.accent.soft,
        color: vars.color.accent.solid,
      },
    },
  },
]);

/** Chevron icon wrapper — rotates 180° when the popover is open. */
export const triggerChevronIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `transform ${vars.duration.fast}`,
  selectors: {
    '[data-open] &': { transform: 'rotate(180deg)' },
  },
});

/** Tile height / radius / font + chevron-tile width, per control size. */
export const triggerTileSize = styleVariants({
  sm: {
    minHeight: '2rem',
    borderRadius: vars.radius.sm,
    fontSize: 'var(--cynosure-font-body-sm-size)',
  },
  md: {
    minHeight: '2.5rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-md-size)',
  },
  lg: {
    minHeight: '3rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-lg-size)',
  },
});

export const triggerChevronSize = styleVariants({
  sm: { width: '2rem' },
  md: { width: '2.5rem' },
  lg: { width: '3rem' },
});

/** Text/placeholder inside the value tile — single-line, ellipsis. */
export const triggerValueText = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'start',
  selectors: {
    '&[data-placeholder]': { color: vars.color.foreground.subtle },
  },
});

/** Bare input inside the Combobox value tile. */
export const triggerInput = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: 0,
  selectors: {
    '&::placeholder': { color: vars.color.foreground.subtle },
    '&:disabled': { cursor: 'not-allowed' },
  },
});
