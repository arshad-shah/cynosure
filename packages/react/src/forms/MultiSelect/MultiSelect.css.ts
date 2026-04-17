import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const tagsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1.5'],
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
  paddingBlock: '3px',
  background: vars.color.accent.soft,
  color: vars.color.accent.solidHover,
  border: `1px solid ${vars.color.accent.solid}`,
  borderRadius: vars.radius.sm,
  fontSize: '0.8125em',
  fontWeight: 500,
  lineHeight: 1.2,
  maxWidth: '100%',
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
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
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
  cursor: 'text',
  selectors: {
    '&:disabled': { cursor: 'not-allowed' },
  },
});
