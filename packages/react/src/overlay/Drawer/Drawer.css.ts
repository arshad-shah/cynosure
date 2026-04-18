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
      '&[data-state="open"]': { animation: `${slideInFromTop} ${vars.duration.normal} ease-out` },
      '&[data-state="closed"]': { animation: `${slideOutToTop} ${vars.duration.normal} ease-in` },
    },
  },
  right: {
    top: 0,
    right: 0,
    bottom: 0,
    borderLeftWidth: '1px',
    selectors: {
      '&[data-state="open"]': { animation: `${slideInFromRight} ${vars.duration.normal} ease-out` },
      '&[data-state="closed"]': {
        animation: `${slideOutToRight} ${vars.duration.normal} ease-in`,
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
        animation: `${slideInFromBottom} ${vars.duration.normal} ease-out`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToBottom} ${vars.duration.normal} ease-in`,
      },
    },
  },
  left: {
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: '1px',
    selectors: {
      '&[data-state="open"]': { animation: `${slideInFromLeft} ${vars.duration.normal} ease-out` },
      '&[data-state="closed"]': { animation: `${slideOutToLeft} ${vars.duration.normal} ease-in` },
    },
  },
});

/** Width for left/right, height for top/bottom. */
export const drawerSizeHorizontal = styleVariants({
  sm: { width: '18rem', maxWidth: '100vw' },
  md: { width: '24rem', maxWidth: '100vw' },
  lg: { width: '32rem', maxWidth: '100vw' },
  xl: { width: '48rem', maxWidth: '100vw' },
  full: { width: '100vw' },
});

export const drawerSizeVertical = styleVariants({
  sm: { height: '18vh', maxHeight: '100vh' },
  md: { height: '32vh', maxHeight: '100vh' },
  lg: { height: '48vh', maxHeight: '100vh' },
  xl: { height: '72vh', maxHeight: '100vh' },
  full: { height: '100vh' },
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
