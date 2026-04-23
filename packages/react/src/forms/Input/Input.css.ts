import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from '../shared/control.css.js';

/**
 * Multi-well root — a flex row of wells with a gap between each tile.
 * State is expressed on this root via `data-*` so every descendant well
 * reacts in lockstep (matches DatePicker's pattern).
 */
export const multiWellRoot = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  gap: vars.space[1],
  color: vars.color.foreground.default,
  selectors: {
    '&[data-disabled="true"]': { opacity: 0.6, cursor: 'not-allowed' },
  },
});

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
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
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
      '&:hover': {
        background: vars.color.accent.soft,
        borderColor: vars.color.accent.solid,
        color: vars.color.accent.solid,
      },
      '&:focus-within': {
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
        background: vars.color.feedback.danger.soft,
        color: vars.color.feedback.danger.foreground,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/**
 * The field well — the one that wraps the `<input>`. Flexes to fill, and is
 * the only well that lifts to `background.surface` on focus-within.
 */
export const fieldWell = style([
  fieldWellBase,
  {
    flex: 1,
    minWidth: 0,
    paddingInline: vars.space[3],
    cursor: 'text',
    selectors: {
      [`${multiWellRoot}[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"]) &`]:
        {
          borderColor: vars.color.border.strong,
        },
      '&:focus-within': {
        background: vars.color.background.surface,
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      [`${multiWellRoot}[data-invalid="true"] &:focus-within`]: {
        boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/** Per-size minHeight/font/radius applied to every well in the row. */
export const wellSize = styleVariants({
  sm: {
    minHeight: '2rem',
    borderRadius: vars.radius.sm,
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  },
  md: {
    minHeight: '2.5rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
  },
  lg: {
    minHeight: '3rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
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
