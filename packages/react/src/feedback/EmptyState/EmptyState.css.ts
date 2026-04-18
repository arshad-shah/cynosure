import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const emptyStateRoot = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: vars.space['4'],
  maxWidth: '60ch',
  marginInline: 'auto',
  color: vars.color.foreground.default,
  fontFamily: 'var(--cynosure-font-body-md-family)',
});

export const emptyStateVariant = styleVariants({
  default: { background: 'transparent' },
  subtle: {
    background: vars.color.background.subtle,
    borderRadius: vars.radius.lg,
  },
});

export const emptyStateSize = styleVariants({
  sm: { paddingBlock: vars.space['6'], paddingInline: vars.space['4'] },
  md: { paddingBlock: vars.space['10'], paddingInline: vars.space['6'] },
  lg: { paddingBlock: vars.space['16'], paddingInline: vars.space['8'] },
  xl: { paddingBlock: vars.space['24'], paddingInline: vars.space['10'] },
});

export const emptyStateIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '3rem',
  height: '3rem',
  borderRadius: vars.radius.full,
  background: vars.color.background.muted,
  color: vars.color.foreground.muted,
  fontSize: '1.5rem',
  lineHeight: 0,
});

export const emptyStateTitle = style({
  margin: 0,
  fontFamily: 'var(--cynosure-font-heading-3-family)',
  fontSize: 'var(--cynosure-font-heading-4-size)',
  fontWeight: 'var(--cynosure-font-heading-4-weight)',
  lineHeight: 'var(--cynosure-font-heading-4-line-height)',
  color: vars.color.foreground.default,
});

export const emptyStateDescription = style({
  margin: 0,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  color: vars.color.foreground.muted,
});

export const emptyStateActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: vars.space['2'],
});
