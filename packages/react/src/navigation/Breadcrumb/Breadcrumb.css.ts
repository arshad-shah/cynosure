import { style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const breadcrumbRoot = style({
  display: 'block',
  color: vars.color.foreground.muted,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  lineHeight: 'var(--cynosure-font-body-sm-line-height)',
});

export const breadcrumbList = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space['1'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const breadcrumbItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
});

export const breadcrumbLink = style({
  color: vars.color.foreground.muted,
  textDecoration: 'none',
  borderRadius: vars.radius.xs,
  paddingInline: vars.space['0.5'],
  selectors: {
    '&:hover': {
      color: vars.color.foreground.default,
      textDecoration: 'underline',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});

export const breadcrumbPage = style({
  color: vars.color.foreground.default,
  fontWeight: 500,
  paddingInline: vars.space['0.5'],
});

export const breadcrumbSeparator = style({
  display: 'inline-flex',
  alignItems: 'center',
  color: vars.color.foreground.subtle,
  userSelect: 'none',
});

export const breadcrumbEllipsisButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['0.5'],
  background: 'transparent',
  border: 'none',
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  padding: vars.space['0.5'],
  borderRadius: vars.radius.xs,
  selectors: {
    '&:hover': {
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});
