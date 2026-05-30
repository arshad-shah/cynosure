import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { overlayZoomIn, overlayZoomOut } from '../shared/overlay.css.js';

/**
 * Dialog content surface. Positioned via `position: fixed` + translate so
 * we can animate scale from the centre without layout thrash.
 */
export const dialogContent = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
  width: '100%',
  maxHeight: 'calc(100vh - 2rem)',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow['2xl'],
  padding: vars.space['6'],
  outline: 'none',
  overflow: 'auto',
  zIndex: Number(vars.z.modal),
  selectors: {
    '&[data-state="open"]': {
      animation: `${overlayZoomIn} ${vars.duration.fast} ${vars.easing.easeOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${overlayZoomOut} ${vars.duration.fast} ${vars.easing.easeIn}`,
    },
  },
});

export const dialogSize = styleVariants({
  xs: { maxWidth: '20rem' },
  sm: { maxWidth: '24rem' },
  md: { maxWidth: '32rem' },
  lg: { maxWidth: '40rem' },
  xl: { maxWidth: '56rem' },
  full: {
    maxWidth: 'calc(100vw - 2rem)',
    maxHeight: 'calc(100vh - 2rem)',
    width: 'calc(100vw - 2rem)',
  },
});

export const dialogPositionTop = style({
  top: vars.space['10'],
  transform: 'translate(-50%, 0)',
  selectors: {
    '&[data-state="open"]': {
      animationName: overlayZoomIn,
    },
    '&[data-state="closed"]': {
      animationName: overlayZoomOut,
    },
  },
});

export const dialogHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
});

export const dialogFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: vars.space['2'],
  marginTop: vars.space['2'],
});

export const dialogTitle = style({
  margin: 0,
  fontFamily: 'var(--cynosure-font-heading-3-family)',
  fontSize: 'var(--cynosure-font-heading-3-size)',
  fontWeight: 'var(--cynosure-font-heading-3-weight)',
  lineHeight: 'var(--cynosure-font-heading-3-line-height)',
  color: vars.color.foreground.default,
});

export const dialogDescription = style({
  margin: 0,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  color: vars.color.foreground.muted,
});
