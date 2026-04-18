import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const enter = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});
const exit = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-4px)' },
});

export const navigationMenuRoot = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'max-content',
});

export const navigationMenuList = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1'],
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navigationMenuTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['3'],
  background: 'transparent',
  border: 'none',
  color: vars.color.foreground.default,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontSize: 'var(--cynosure-font-body-md-size)',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  outline: 'none',
  selectors: {
    '&:hover, &[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const navigationMenuCaret = style({
  transitionProperty: 'transform',
  transitionDuration: vars.duration.fast,
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const navigationMenuContent = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['3'],
  zIndex: Number(vars.z.dropdown),
  outline: 'none',
  selectors: {
    '&[data-motion="from-start"], &[data-motion="from-end"]': {
      animation: `${enter} ${vars.duration.fast} ease-out`,
    },
    '&[data-motion="to-start"], &[data-motion="to-end"]': {
      animation: `${exit} ${vars.duration.fast} ease-in`,
    },
  },
});

export const navigationMenuLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingBlock: vars.space['1.5'],
  paddingInline: vars.space['3'],
  color: vars.color.foreground.default,
  textDecoration: 'none',
  borderRadius: vars.radius.sm,
  fontSize: 'var(--cynosure-font-body-md-size)',
  fontWeight: 500,
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-active="true"]': {
      color: vars.color.accent.solid,
    },
  },
});

export const navigationMenuIndicator = style({
  position: 'relative',
  top: '100%',
  display: 'flex',
  height: '8px',
  alignItems: 'flex-end',
  justifyContent: 'center',
  overflow: 'hidden',
  transitionProperty: 'width, transform',
  transitionDuration: vars.duration.fast,
  zIndex: 1,
  selectors: {
    '&[data-state="hidden"]': {
      opacity: 0,
    },
    '&[data-state="visible"]': {
      opacity: 1,
    },
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const navigationMenuIndicatorArrow = style({
  position: 'relative',
  top: '70%',
  width: '10px',
  height: '10px',
  transform: 'rotate(45deg)',
  background: vars.color.background.surface,
  borderTop: `1px solid ${vars.color.border.default}`,
  borderInlineStart: `1px solid ${vars.color.border.default}`,
  borderStartStartRadius: vars.radius.xs,
});

export const navigationMenuViewport = style({
  position: 'relative',
  width: 'var(--radix-navigation-menu-viewport-width)',
  height: 'var(--radix-navigation-menu-viewport-height)',
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  overflow: 'hidden',
  transitionProperty: 'width, height',
  transitionDuration: vars.duration.fast,
  transformOrigin: 'top center',
  selectors: {
    '[data-cynosure-reduced-motion] &': {
      transitionDuration: '0s',
    },
  },
});

export const navigationMenuViewportWrapper = style({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  top: '100%',
  left: 0,
  perspective: '2000px',
});
