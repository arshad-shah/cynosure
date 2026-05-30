import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const treeRoot = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  width: '100%',
  color: vars.color.foreground.default,
});

export const treeGroup = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const treeItem = style({
  position: 'relative',
});

export const treeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['2'],
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  minHeight: '1.75rem',
  selectors: {
    '&:hover': {
      background: vars.color.background.subtle,
    },
    '&[data-focused="true"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: `inset 0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-selected="true"]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
      fontWeight: 500,
    },
    '&[data-disabled="true"]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const treeChevron = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1rem',
  height: '1rem',
  color: vars.color.foreground.muted,
  transition: `transform ${vars.duration.fast} ${vars.easing.easeInOut}`,
  selectors: {
    '[data-expanded="true"] > [data-slot="row"] > &': {
      transform: 'rotate(90deg)',
    },
    '[dir="rtl"] [data-expanded="true"] > [data-slot="row"] > &': {
      transform: 'rotate(-90deg)',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const treeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  flex: '1 1 auto',
  minWidth: 0,
});

export const treeLeaf = style({
  width: '1rem',
});
