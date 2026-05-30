import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const popoverIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const popoverOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-4px)' },
});

/**
 * Floating content shell for Popover + HoverCard. Radix places
 * side-specific `data-side` attributes; animations are direction-agnostic
 * to stay simple (the slight y-offset reads as "appear from trigger").
 */
export const popoverContent = style({
  minWidth: '12rem',
  // Never exceed the viewport on small screens. Collision-shifting can keep an
  // element on-screen but can't rescue one that's wider/taller than the
  // viewport, so cap both axes to the available space (minus an 8px gutter on
  // each side) and let the body scroll. `dvh` tracks the mobile visual
  // viewport so browser chrome never clips the panel.
  maxWidth: 'min(28rem, calc(100vw - 1rem))',
  maxHeight: 'calc(100dvh - 1rem)',
  overflow: 'auto',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['4'],
  outline: 'none',
  zIndex: Number(vars.z.popover),
  selectors: {
    '&[data-state="open"]': {
      animation: `${popoverIn} ${vars.duration.fast} ${vars.easing.easeOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${popoverOut} ${vars.duration.fast} ${vars.easing.easeIn}`,
    },
  },
});

/** Small caret pointing at the trigger. Fill with the surface colour. */
export const popoverArrow = style({
  fill: vars.color.background.surface,
  stroke: vars.color.border.default,
  strokeWidth: 1,
});
