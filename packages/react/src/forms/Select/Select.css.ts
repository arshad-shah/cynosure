import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const trigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  width: '100%',
  cursor: 'default',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  border: 'none',
  outline: 'none',
  paddingBlock: vars.space['1'],
  selectors: {
    '&[data-disabled]': {
      cursor: 'not-allowed',
    },
  },
});

export const triggerValue = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'start',
  selectors: {
    '&[data-placeholder]': {
      color: vars.color.foreground.subtle,
    },
  },
});

export const triggerIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.foreground.muted,
  flexShrink: 0,
  transition: `transform ${vars.duration.fast}`,
  selectors: {
    '[data-open] &': {
      transform: 'rotate(180deg)',
    },
  },
});

export const itemCheck = style({
  display: 'inline-flex',
  alignItems: 'center',
  color: 'currentColor',
  flexShrink: 0,
  opacity: 0,
  selectors: {
    '[data-selected] &': {
      opacity: 1,
    },
  },
});
