import { style } from '@vanilla-extract/css';
import { focusRingInset } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const dataTableWrap = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
});

export const dataTableToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['3'],
  flexWrap: 'wrap',
});

export const dataTableSurface = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  background: vars.color.background.surface,
});

export const dataTableScroll = style({
  width: '100%',
  overflow: 'auto',
  maxHeight: '100%',
});

export const sortableHeader = style({
  all: 'unset',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  cursor: 'pointer',
  fontWeight: 'inherit',
  color: 'inherit',
  userSelect: 'none',
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRingInset,
      borderRadius: vars.radius.sm,
    },
  },
});

export const sortIcon = style({
  display: 'inline-flex',
  opacity: 0.4,
  selectors: {
    '[aria-sort="ascending"] &, [aria-sort="descending"] &': {
      opacity: 1,
      color: vars.color.accent.solid,
    },
  },
});

export const emptyCell = style({
  textAlign: 'center',
  padding: vars.space['8'],
  color: vars.color.foreground.muted,
});

export const loadingOverlay = style({
  position: 'relative',
});

export const paginationFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['3'],
  flexWrap: 'wrap',
});

export const selectionSummary = style({
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
});
