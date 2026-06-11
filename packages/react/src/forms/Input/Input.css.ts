import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from '../shared/control.css.js';
import { segmentedTrack } from '../shared/segmented.css.js';

/**
 * Multi-well root — the shared segmented track (tinted `subtle` well +
 * hairline border, 4px padding/gap) wrapping the row of raised well tiles.
 * State is expressed on this root via `data-*` so every descendant well
 * reacts in lockstep (matches DatePicker's pattern); the focus ring and
 * invalid tint live on the track, like `NumberInput`.
 */
export const multiWellRoot = style([
  segmentedTrack,
  {
    width: '100%',
    color: vars.color.foreground.default,
    selectors: {
      // Variants first, states after — equal specificity, so source order
      // lets the focus/invalid borders win over the variant's border reset.
      '&[data-variant="filled"]': {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      '&[data-variant="ghost"]': {
        background: 'transparent',
        borderColor: 'transparent',
      },
      '&[data-focus-within="true"]:not([data-invalid="true"])': {
        borderColor: vars.color.border.focus,
        boxShadow: focusRing,
      },
      '&[data-invalid="true"]': {
        borderColor: vars.color.feedback.danger.border,
      },
      '&[data-invalid="true"][data-focus-within="true"]': {
        boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
      },
      '&[data-readonly="true"]': { background: vars.color.background.muted },
      '&[data-disabled="true"]': { opacity: 0.6, cursor: 'not-allowed' },
    },
  },
]);

/** Container for a group of leading or trailing slots — zero-sized if empty. */
export const slotGroup = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  gap: vars.space[1],
  flex: '0 0 auto',
});

/**
 * Non-interactive slot well — icons, prefix text like "https://". Inherits
 * tile chrome from fieldWellBase; adds Input-scoped variant / state selectors.
 */
export const inertWell = style([
  fieldWellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    paddingInline: vars.space[1],
    minWidth: '2rem',
    color: vars.color.foreground.subtle,
    cursor: 'default',
    pointerEvents: 'none',
    selectors: {
      // Ghost track: tiles sit flat until the control is interacted with.
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
    },
  },
]);

/**
 * Interactive slot well — clear button, password toggle, custom action
 * buttons. Accent-tinted hover/pressed, picks up danger tint on invalid.
 */
export const actionWell = style([
  fieldWellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    minWidth: '2rem',
    padding: 0,
    cursor: 'pointer',
    color: vars.color.foreground.muted,
    selectors: {
      // Ghost track: flat until hover, then borrow the raised surface.
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        boxShadow: 'none',
      },
      '&:hover': {
        background: vars.color.accent.soft,
        borderColor: vars.color.accent.solid,
        color: vars.color.accent.solid,
      },
      '&:focus-within': {
        borderColor: vars.color.border.focus,
        boxShadow: focusRing,
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
        background: vars.color.feedback.danger.soft,
        color: vars.color.feedback.danger.foreground,
      },
    },
  },
]);

/**
 * The field well — the raised tile that wraps the `<input>`. Flexes to fill.
 * The focus ring lives on the track (`multiWellRoot`), like `NumberInput`;
 * the tile itself only tints its border on hover / invalid.
 */
export const fieldWell = style([
  fieldWellBase,
  {
    flex: 1,
    minWidth: 0,
    paddingInline: vars.space[3],
    cursor: 'text',
    selectors: {
      // Ghost track: the tile is flat at rest and raises while editing.
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-variant="ghost"] &:focus-within`]: {
        background: vars.color.background.raised,
        boxShadow: vars.shadow.xs,
      },
      [`${multiWellRoot}[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"]) &`]:
        {
          borderColor: vars.color.border.strong,
        },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
    },
  },
]);

/** Per-size minHeight/font/radius applied to every well in the row. */
export const wellSize = styleVariants({
  sm: {
    minHeight: '2rem',
    borderRadius: vars.radius.sm,
    fontSize: vars.font.body.sm.size,
    lineHeight: vars.font.body.sm.lineHeight,
  },
  md: {
    minHeight: '2.5rem',
    borderRadius: vars.radius.md,
    fontSize: vars.font.body.md.size,
    lineHeight: vars.font.body.md.lineHeight,
  },
  lg: {
    minHeight: '3rem',
    borderRadius: vars.radius.md,
    fontSize: vars.font.body.lg.size,
    lineHeight: vars.font.body.lg.lineHeight,
  },
});

/** The raw `<input>` inside the fieldWell — no chrome, just text layout. */
export const inputElement = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  paddingBlock: 0,
  selectors: {
    '&::placeholder': { color: vars.color.foreground.subtle },
    '&:disabled': { cursor: 'not-allowed' },
  },
});

// Hide WebKit/Chrome's built-in type="search" decorations — we render our
// own clear button in the trailing well. These pseudo-elements aren't in
// vanilla-extract's type map, so globalStyle is required.
globalStyle(`${inputElement}::-webkit-search-cancel-button`, { appearance: 'none' });
globalStyle(`${inputElement}::-webkit-search-decoration`, { appearance: 'none' });
globalStyle(`${inputElement}::-webkit-search-results-button`, { appearance: 'none' });
globalStyle(`${inputElement}::-webkit-search-results-decoration`, { appearance: 'none' });
