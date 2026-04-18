import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Shared animation keyframes + backdrop + close-button styles for every
 * portal'd overlay in Phase 09. Radix's `data-state="open"` / `data-state="closed"`
 * attribute drives the enter/exit toggle.
 */

export const overlayFadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const overlayFadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const overlayZoomIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.96)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

export const overlayZoomOut = keyframes({
  from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  to: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.96)' },
});

export const overlaySlideIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const overlaySlideOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-4px)' },
});

/**
 * Full-viewport semi-transparent scrim. Radix mounts this inside its Portal
 * and toggles `data-state="open|closed"`. Tokens already zero
 * `--cynosure-duration-*` under `prefers-reduced-motion`, which short-circuits
 * the visible animation.
 */
export const overlayBackdrop = style({
  position: 'fixed',
  inset: 0,
  background: vars.color.background.overlay,
  zIndex: Number(vars.z.overlay),
  selectors: {
    '&[data-state="open"]': {
      animation: `${overlayFadeIn} ${vars.duration.fast} ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${overlayFadeOut} ${vars.duration.fast} ease-in`,
    },
  },
});

/** Close-button slot rendered top-right of Dialog / Drawer content. */
export const overlayCloseButton = style({
  position: 'absolute',
  top: vars.space['3'],
  right: vars.space['3'],
  zIndex: 1,
});
