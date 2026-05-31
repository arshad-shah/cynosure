import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Edge-anchored overlay. Four `side` variants (top/right/bottom/left) each
 * anchor the surface to the matching viewport edge and animate it in along
 * that axis.
 */

const slideInFromRight = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
});
const slideOutToRight = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' },
});
const slideInFromLeft = keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(0)' },
});
const slideOutToLeft = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(-100%)' },
});
const slideInFromTop = keyframes({
  from: { transform: 'translateY(-100%)' },
  to: { transform: 'translateY(0)' },
});
const slideOutToTop = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(-100%)' },
});
const slideInFromBottom = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});
const slideOutToBottom = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(100%)' },
});

export const drawerContent = style({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  borderColor: vars.color.border.default,
  borderStyle: 'solid',
  borderWidth: 0,
  boxShadow: vars.shadow['2xl'],
  padding: vars.space['6'],
  gap: vars.space['4'],
  outline: 'none',
  overflow: 'auto',
  zIndex: Number(vars.z.modal),
});

export const drawerSide = styleVariants({
  top: {
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: '1px',
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromTop} ${vars.duration.normal} ${vars.easing.easeOut}`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToTop} ${vars.duration.normal} ${vars.easing.easeIn}`,
      },
    },
  },
  right: {
    top: 0,
    right: 0,
    bottom: 0,
    borderLeftWidth: '1px',
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromRight} ${vars.duration.normal} ${vars.easing.easeOut}`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToRight} ${vars.duration.normal} ${vars.easing.easeIn}`,
      },
    },
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: '1px',
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromBottom} ${vars.duration.normal} ${vars.easing.easeOut}`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToBottom} ${vars.duration.normal} ${vars.easing.easeIn}`,
      },
    },
  },
  left: {
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: '1px',
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromLeft} ${vars.duration.normal} ${vars.easing.easeOut}`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToLeft} ${vars.duration.normal} ${vars.easing.easeIn}`,
      },
    },
  },
});

/*
 * Width for left/right drawers. `min(<size>, calc(100dvw - <gutter>))` so the
 * drawer shrinks to fit narrow screens (leaving a small gutter on the open
 * edge) instead of overflowing and clipping its content. `full` spans the
 * viewport. `dvw` tracks the mobile visual viewport.
 */
export const drawerSizeHorizontal = styleVariants({
  sm: { width: 'min(18rem, calc(100dvw - 3rem))' },
  md: { width: 'min(24rem, calc(100dvw - 3rem))' },
  lg: { width: 'min(32rem, calc(100dvw - 3rem))' },
  xl: { width: 'min(48rem, calc(100dvw - 3rem))' },
  full: { width: '100dvw' },
});

// `dvh` (dynamic viewport height) so top/bottom drawers respect the mobile
// browser's collapsing chrome and never run off-screen.
export const drawerSizeVertical = styleVariants({
  sm: { height: '18dvh', maxHeight: '100dvh' },
  md: { height: '32dvh', maxHeight: '100dvh' },
  lg: { height: '48dvh', maxHeight: '100dvh' },
  xl: { height: '72dvh', maxHeight: '100dvh' },
  full: { height: '100dvh' },
});

export const drawerHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
});

export const drawerFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: vars.space['2'],
  marginTop: 'auto',
});

export const drawerTitle = style({
  margin: 0,
  fontFamily: 'var(--cynosure-font-heading-3-family)',
  fontSize: 'var(--cynosure-font-heading-3-size)',
  fontWeight: 'var(--cynosure-font-heading-3-weight)',
  lineHeight: 'var(--cynosure-font-heading-3-line-height)',
  color: vars.color.foreground.default,
});

export const drawerDescription = style({
  margin: 0,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  color: vars.color.foreground.muted,
});
