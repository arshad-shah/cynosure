import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const scrollAreaRoot = style({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
});

export const scrollAreaViewport = style({
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

// Radix's ScrollArea.Viewport wraps its children in an inline-styled div.
// Force it back to a flow-layout box so percentage-sized children collapse correctly.
globalStyle(`${scrollAreaViewport} > div[style]`, {
  display: 'block !important',
});

export const scrollAreaScrollbar = style({
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: 2,
  background: 'transparent',
  transition: `opacity ${vars.duration.fast} ease`,
  selectors: {
    '&[data-orientation="vertical"]': {
      width: 10,
    },
    '&[data-orientation="horizontal"]': {
      flexDirection: 'column',
      height: 10,
    },
    '&:hover': {
      background: vars.color.background.subtle,
    },
  },
});

export const scrollAreaThumb = style({
  flex: 1,
  background: vars.color.border.strong,
  borderRadius: vars.radius.full,
  position: 'relative',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      minWidth: 44,
      minHeight: 44,
    },
  },
});

export const scrollAreaCorner = style({
  background: vars.color.background.subtle,
});
