import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const resizableRoot = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  selectors: {
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
    },
  },
});

export const resizablePanel = style({
  overflow: 'hidden',
});

export const resizableHandle = style({
  position: 'relative',
  background: vars.color.border.subtle,
  transition: `background ${vars.duration.fast} ${vars.easing.easeInOut}`,
  flex: '0 0 auto',
  selectors: {
    '&:hover, &[data-resize-handle-active]': {
      background: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      zIndex: 1,
    },
    '[data-orientation="horizontal"] > &': {
      width: 4,
      cursor: 'col-resize',
    },
    '[data-orientation="vertical"] > &': {
      height: 4,
      cursor: 'row-resize',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const resizableHandleGrip = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'inline-flex',
  color: vars.color.foreground.muted,
});
