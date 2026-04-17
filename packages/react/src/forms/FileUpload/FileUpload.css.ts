import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
  width: '100%',
});

export const dropZone = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['2'],
  padding: vars.space['6'],
  border: `2px dashed ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  transition: `border-color ${vars.duration.fast}, background-color ${vars.duration.fast}`,
  outline: 'none',
  selectors: {
    '&[data-over="true"]': {
      borderColor: vars.color.accent.solid,
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
});

export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
});

export const listItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  padding: vars.space['2'],
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.subtle,
});

export const thumbnail = style({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: vars.radius.sm,
  objectFit: 'cover',
  background: vars.color.background.muted,
});

export const fileMeta = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const fileName = style({
  fontSize: 'var(--lumen-font-body-md-size)',
  fontWeight: 500,
  color: vars.color.foreground.default,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const fileSize = style({
  fontSize: 'var(--lumen-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

export const removeButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: vars.color.foreground.muted,
  borderRadius: vars.radius.sm,
  selectors: {
    '&:hover': {
      background: vars.color.background.muted,
      color: vars.color.foreground.default,
    },
  },
});
