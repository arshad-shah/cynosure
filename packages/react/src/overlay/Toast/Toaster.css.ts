import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

/**
 * Re-skinned `sonner` toast. Colours (incl. per-variant) are driven by CSS
 * custom properties sonner exposes (`--normal-bg`, `--success-bg`, …) — those
 * are set at the `Toaster` root via its `style` prop. This file owns the
 * typographic/spacing shell and a few high-specificity overrides to beat
 * sonner's own selectors.
 */
export const toastBase = style({
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['3'],
  fontFamily: vars.font.body.md.family,
});

export const toastTitle = style({
  fontWeight: vars.font.weight.medium,
  fontSize: vars.font.body.md.size,
  lineHeight: vars.font.body.md.lineHeight,
});

export const toastDescription = style({
  fontSize: vars.font.body.sm.size,
  lineHeight: vars.font.body.sm.lineHeight,
  opacity: 0.85,
});

export const toastActionButton = style({
  background: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.font.body.sm.size,
  fontWeight: vars.font.weight.medium,
  cursor: 'pointer',
});

export const toastCancelButton = style({
  background: 'transparent',
  color: 'currentColor',
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  border: '1px solid currentColor',
  fontSize: vars.font.body.sm.size,
  cursor: 'pointer',
  opacity: 0.8,
});

export const toastIcon = style({
  animation: `${spin} 1s linear infinite`,
});
