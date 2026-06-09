import { style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/**
 * Selected-chips row inside the trigger. Single line, never wraps — the
 * trigger keeps a fixed height no matter how many items are selected. Chips
 * that don't fit are collapsed into a trailing `+N` badge (computed by
 * measuring against the hidden `measureRow`).
 */
export const tagsRow = style({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: vars.space['1.5'],
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
});

export const placeholder = style({
  color: vars.color.foreground.subtle,
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const tag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  flex: '0 0 auto',
  maxWidth: '12rem',
  paddingInline: vars.space['2'],
  paddingBlock: '3px',
  background: vars.color.accent.soft,
  color: vars.color.accent.solidHover,
  border: `1px solid ${vars.color.accent.solid}`,
  borderRadius: vars.radius.sm,
  fontSize: '0.8125em',
  fontWeight: 500,
  lineHeight: 1.2,
});

/** Truncate long labels so one wide chip can't blow out the row. */
export const tagLabel = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** The `+N` overflow counter chip — neutral, non-interactive. */
export const overflowBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  flex: '0 0 auto',
  paddingInline: vars.space['2'],
  paddingBlock: '3px',
  background: vars.color.background.muted,
  color: vars.color.foreground.muted,
  borderRadius: vars.radius.sm,
  fontSize: '0.8125em',
  fontWeight: 600,
  lineHeight: 1.2,
  fontVariantNumeric: 'tabular-nums',
});

export const tagRemove = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'currentColor',
  padding: 0,
  marginInlineStart: '2px',
  width: '1rem',
  height: '1rem',
  borderRadius: vars.radius.full,
  opacity: 0.7,
  flex: '0 0 auto',
  transitionProperty: 'opacity, background-color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': {
      opacity: 1,
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
    '&:focus-visible': {
      outline: 'none',
      opacity: 1,
      boxShadow: focusRing,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
    },
  },
});

/** Search field pinned to the top of the popover. */
export const searchWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
  marginBottom: vars.space['1'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  color: vars.color.foreground.muted,
});

export const searchInput = style({
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.foreground.default,
  font: 'inherit',
  padding: 0,
  selectors: {
    '&::placeholder': { color: vars.color.foreground.subtle },
  },
});

/** One option row in the dropdown — shows a check when selected. */
export const option = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  paddingBlock: vars.space['2'],
  paddingInline: vars.space['2'],
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  color: vars.color.foreground.default,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-active="true"]': {
      background: vars.color.accent.soft,
    },
    '&[data-selected="true"]': {
      color: vars.color.accent.solidHover,
      fontWeight: 500,
    },
    '&[aria-disabled="true"]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const optionLabel = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** Checkmark box on the leading edge of each option. */
export const optionCheck = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1rem',
  height: '1rem',
  flex: '0 0 auto',
  borderRadius: vars.radius.xs,
  border: `1.5px solid ${vars.color.border.strong}`,
  color: vars.color.accent.onSolid,
  selectors: {
    '[data-selected="true"] &': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
    },
  },
});
