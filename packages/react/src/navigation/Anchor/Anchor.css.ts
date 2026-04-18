import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const anchorWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  scrollMarginTop: 'var(--cynosure-anchor-offset, 0)',
});

globalStyle(
  `${anchorWrapper}:hover > [data-anchor-link], ${anchorWrapper}:focus-within > [data-anchor-link]`,
  {
    opacity: 1,
  },
);

export const anchorHeading = style({
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  color: vars.color.foreground.default,
});

export const anchorLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  color: vars.color.foreground.muted,
  padding: vars.space['0.5'],
  borderRadius: vars.radius.xs,
  textDecoration: 'none',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  transitionProperty: 'opacity, color, background',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': {
      color: vars.color.accent.solid,
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      opacity: 1,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});
