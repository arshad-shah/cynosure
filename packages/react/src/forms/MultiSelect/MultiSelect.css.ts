import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const tagsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1'],
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  paddingBlock: vars.space['1'],
});

export const tag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingInline: vars.space['2'],
  paddingBlock: '2px',
  background: vars.color.accent.soft,
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  fontSize: '0.875em',
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
  selectors: {
    '&:hover': {
      color: vars.color.accent.solidHover,
    },
  },
});

export const inlineInput = style({
  flex: 1,
  minWidth: '4rem',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: 0,
});
