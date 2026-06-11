import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const switchLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  fontSize: vars.font.body.md.size,
  lineHeight: vars.font.body.md.lineHeight,
  color: vars.color.foreground.default,
  cursor: 'pointer',
  selectors: {
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
    },
  },
});

export const switchRoot = style({
  position: 'relative',
  flexShrink: 0,
  display: 'inline-block',
  boxSizing: 'border-box',
  background: vars.color.background.muted,
  // A clearly visible hairline so the off-state track reads on any surface.
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.full,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, box-shadow, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.easing.easeOut,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-6px',
    },
    '&[data-state="checked"]': {
      background: vars.color.accent.solid,
      borderColor: vars.color.accent.solid,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
    '&[data-disabled]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    '&[data-loading="true"]': {
      cursor: 'progress',
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"][data-state="checked"]': {
      background: vars.color.feedback.danger.solid,
      borderColor: vars.color.feedback.danger.solid,
    },
    '&[data-invalid="true"]:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
    },
  },
});

/**
 * Sizing. Border-box outer `width`/`height` (1px border). The thumb is
 * absolutely positioned, so each size only needs to publish:
 *  - `--cyn-sw-on`  — on-thumb diameter (fills the track minus a 2px gap)
 *  - `--cyn-sw-off` — off-thumb diameter (Material-style smaller rest thumb)
 *  - `--cyn-sw-off-inset` — the off thumb's leading gap, balanced so it never
 *    hugs the border (equal to its vertical margin)
 * The on-thumb's resting position is derived in `switchThumb` as
 * `calc(100% - on - 2px)`, so it always sits a 2px gap from the trailing edge.
 */
export const switchSize = styleVariants({
  sm: {
    width: '2rem', // 32 — padding-box 30×16
    height: '1.125rem', // 18
    vars: {
      ['--cyn-sw-on' as string]: '0.75rem', // 12
      ['--cyn-sw-off' as string]: '0.5625rem', // 9
      ['--cyn-sw-off-inset' as string]: '0.21875rem', // 3.5 = (16 − 9) / 2
    },
  },
  md: {
    width: '2.25rem', // 36 — padding-box 34×18
    height: '1.25rem', // 20
    vars: {
      ['--cyn-sw-on' as string]: '0.875rem', // 14
      ['--cyn-sw-off' as string]: '0.625rem', // 10
      ['--cyn-sw-off-inset' as string]: '0.25rem', // 4 = (18 − 10) / 2
    },
  },
  lg: {
    width: '2.75rem', // 44 — padding-box 42×22
    height: '1.5rem', // 24
    vars: {
      ['--cyn-sw-on' as string]: '1.125rem', // 18
      ['--cyn-sw-off' as string]: '0.875rem', // 14
      ['--cyn-sw-off-inset' as string]: '0.25rem', // 4 = (22 − 14) / 2
    },
  },
});

/**
 * Material-You-style thumb: small when off, growing to fill the track as it
 * slides on. Absolutely positioned and centered vertically; `inset-inline-start`
 * drives the horizontal travel (auto-flipping in RTL). At rest it sits a
 * balanced gap (`--cyn-sw-off-inset`) from the leading edge — never jammed
 * against the border. `data-keep-thumb` keeps it full-size (for an off icon).
 */
export const switchThumb = style({
  position: 'absolute',
  top: '50%',
  insetInlineStart: 'var(--cyn-sw-off-inset)',
  display: 'grid',
  placeItems: 'center',
  boxSizing: 'border-box',
  width: 'var(--cyn-sw-off)',
  height: 'var(--cyn-sw-off)',
  background: vars.color.background.raised,
  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.sm,
  transform: 'translateY(-50%)',
  transitionProperty: 'inset-inline-start, width, height',
  transitionDuration: vars.duration.normal,
  transitionTimingFunction: vars.easing.spring,
  willChange: 'inset-inline-start, width, height',
  selectors: {
    '&[data-keep-thumb="true"]': {
      width: 'var(--cyn-sw-on)',
      height: 'var(--cyn-sw-on)',
      insetInlineStart: '2px',
    },
    '&[data-state="checked"]': {
      width: 'var(--cyn-sw-on)',
      height: 'var(--cyn-sw-on)',
      insetInlineStart: 'calc(100% - var(--cyn-sw-on) - 2px)',
    },
    // While loading, the thumb stays full-size at whichever position it's
    // settling toward, so the spinner always fits — even when toggling *off*,
    // where the resting thumb would normally be too small for the loader. It
    // shrinks back to the small off thumb once loading ends.
    '&[data-loading="true"]': {
      width: 'var(--cyn-sw-on)',
      height: 'var(--cyn-sw-on)',
    },
    '&[data-loading="true"][data-state="unchecked"]': {
      insetInlineStart: '2px',
    },
    // Press feedback (Material-You): the resting thumb swells toward full size
    // while the switch is held, driven by the root's active state.
    [`${switchRoot}:active:not([data-disabled]):not([data-loading="true"]) &[data-state="unchecked"]`]:
      {
        width: 'var(--cyn-sw-on)',
        height: 'var(--cyn-sw-on)',
        insetInlineStart: '2px',
      },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  },
});

/** Icon shown inside the thumb. Centered, scales its glyph to the thumb. */
export const thumbIcon = style({
  display: 'grid',
  placeItems: 'center',
  lineHeight: 0,
});

/** On-state glyph colour (accent), tinted to danger when invalid. */
export const thumbIconChecked = style({
  color: vars.color.accent.solid,
  selectors: {
    [`${switchRoot}[data-invalid="true"] &`]: {
      color: vars.color.feedback.danger.solid,
    },
  },
});

/** Off-state glyph colour — muted, recedes against the white thumb. */
export const thumbIconUnchecked = style({
  color: vars.color.foreground.muted,
});

export const thumbLoader = style({
  display: 'block',
  color: vars.color.accent.solid,
  animation: `${spin} 0.8s linear infinite`,
});
