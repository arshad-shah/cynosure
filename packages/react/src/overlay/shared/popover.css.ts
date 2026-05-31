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
  // Outer surface: owns the visual shell (background/border/shadow) and acts
  // as the positioning containing block. Overflow is kept `visible` so the
  // caret can poke past the edge toward the trigger; the inner viewport
  // (`popoverViewport`) owns scrolling instead.
  position: 'fixed',
  minWidth: '12rem',
  // Never exceed the viewport on small screens. Collision-shifting can keep an
  // element on-screen but can't rescue one that's wider/taller than the
  // viewport, so cap the width to the available space (minus an 8px gutter on
  // each side); the inner viewport caps height and scrolls.
  maxWidth: 'min(28rem, calc(100vw - 1rem))',
  overflow: 'visible',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
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

/**
 * Inner scroll viewport. Holds the padding and caps height so tall content
 * scrolls without clipping the caret rendered as a sibling on the outer
 * surface. `dvh` tracks the mobile visual viewport so browser chrome never
 * clips the panel. `borderRadius: inherit` keeps scrolled content rounded to
 * match the surface.
 */
export const popoverViewport = style({
  maxHeight: 'calc(100dvh - 1rem)',
  overflow: 'auto',
  padding: vars.space['4'],
  borderRadius: 'inherit',
});

/** Small caret pointing at the trigger. Fill with the surface colour. */
export const popoverArrow = style({
  fill: vars.color.background.surface,
  stroke: vars.color.border.default,
  strokeWidth: 1,
});
