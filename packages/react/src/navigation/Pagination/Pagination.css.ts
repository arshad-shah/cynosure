import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const paginationRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const paginationList = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['0.5'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const paginationButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '2.25rem',
  padding: vars.space['1'],
  background: 'transparent',
  color: vars.color.foreground.muted,
  border: '1px solid transparent',
  borderRadius: vars.radius.sm,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontVariantNumeric: 'tabular-nums',
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    '&[aria-current="page"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[aria-current="page"]:hover': {
      background: vars.color.accent.solidHover,
      color: vars.color.accent.onSolid,
    },
  },
});

export const paginationButton = paginationButtonBase;

export const paginationSize = styleVariants({
  sm: {
    minWidth: '1.75rem',
    fontSize: 'var(--cynosure-font-body-sm-size)',
    padding: vars.space['0.5'],
  },
  md: {
    fontSize: 'var(--cynosure-font-body-md-size)',
  },
  lg: {
    minWidth: '2.75rem',
    fontSize: 'var(--cynosure-font-body-lg-size)',
    padding: vars.space['2'],
  },
});

export const paginationEllipsis = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '2.25rem',
  padding: vars.space['1'],
  color: vars.color.foreground.subtle,
  userSelect: 'none',
});
