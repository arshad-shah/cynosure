import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const stepperRoot = style({
  display: 'flex',
  gap: vars.space['2'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
  selectors: {
    '&[data-orientation="horizontal"]': {
      alignItems: 'flex-start',
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
    },
  },
});

export const stepperItem = style({
  display: 'flex',
  flex: '1 1 0',
  minWidth: 0,
  gap: vars.space['2'],
  alignItems: 'flex-start',
  selectors: {
    '[data-orientation="vertical"] > &': {
      flex: '0 0 auto',
    },
  },
});

export const stepperBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
  minWidth: 0,
  flex: '1 1 auto',
});

export const stepperButton = style({
  display: 'flex',
  flex: '1 1 0',
  gap: vars.space['2'],
  alignItems: 'flex-start',
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  padding: 0,
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderRadius: vars.radius.sm,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

export const stepperMarker = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
  color: vars.color.foreground.muted,
  fontFamily: 'var(--lumen-font-body-sm-family)',
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  selectors: {
    '&[data-status="active"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[data-status="complete"]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
      borderColor: vars.color.accent.solid,
    },
    '&[data-status="error"]': {
      background: vars.color.feedback.danger.solid,
      color: vars.color.feedback.danger.foreground,
      borderColor: vars.color.feedback.danger.border,
    },
  },
});

export const stepperMarkerSize = styleVariants({
  sm: { width: '1.5rem', height: '1.5rem', fontSize: 'var(--lumen-font-body-xs-size, 0.75rem)' },
  md: { width: '1.75rem', height: '1.75rem' },
  lg: { width: '2.25rem', height: '2.25rem', fontSize: 'var(--lumen-font-body-md-size)' },
});

export const stepperVariant = styleVariants({
  numbered: {},
  dots: {},
  lines: {},
  icons: {},
});

export const stepperConnector = style({
  flex: '1 1 auto',
  minHeight: '1px',
  minWidth: '1rem',
  margin: 0,
  background: vars.color.border.subtle,
  selectors: {
    '[data-orientation="horizontal"] &': {
      height: '2px',
      marginTop: '0.85rem',
    },
    '[data-orientation="vertical"] &': {
      width: '2px',
      alignSelf: 'stretch',
      marginInlineStart: '0.85rem',
      marginBlock: vars.space['1'],
    },
    '&[data-complete="true"]': {
      background: vars.color.accent.solid,
    },
  },
});

export const stepperTitle = style({
  fontFamily: 'var(--lumen-font-body-md-family)',
  fontSize: 'var(--lumen-font-body-md-size)',
  fontWeight: 600,
  color: vars.color.foreground.default,
  margin: 0,
  selectors: {
    '[data-status="pending"] &': {
      color: vars.color.foreground.muted,
      fontWeight: 500,
    },
    '[data-status="error"] &': {
      color: vars.color.feedback.danger.foreground,
    },
  },
});

export const stepperDescription = style({
  fontSize: 'var(--lumen-font-body-sm-size)',
  color: vars.color.foreground.muted,
  margin: 0,
});

export const stepperVariantDot = style({
  width: '0.75rem',
  height: '0.75rem',
  border: 'none',
});

export const stepperVariantLine = style({
  width: '100%',
  height: '3px',
  borderRadius: vars.radius.full,
  border: 'none',
  background: vars.color.border.subtle,
  selectors: {
    '&[data-status="active"], &[data-status="complete"]': {
      background: vars.color.accent.solid,
    },
  },
});
