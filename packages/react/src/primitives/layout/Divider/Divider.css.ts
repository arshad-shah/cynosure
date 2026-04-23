import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../../styles/vars.css.js';

export const dividerBase = style({
  margin: 0,
  padding: 0,
  border: 0,
  background: 'transparent',
  flexShrink: 0,
});

export const dividerTone = styleVariants({
  subtle: { color: vars.color.border.subtle },
  default: { color: vars.color.border.default },
});

export const dividerHorizontal = style({
  display: 'block',
  width: '100%',
  height: 0,
  borderTopStyle: 'solid',
  borderTopColor: 'currentColor',
  borderTopWidth: 'var(--cynosure-divider-thickness, 1px)',
});

export const dividerVertical = style({
  display: 'inline-block',
  width: 0,
  height: 'var(--cynosure-divider-length, auto)',
  minHeight: '1.5em',
  alignSelf: 'stretch',
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: 'currentColor',
  borderInlineStartWidth: 'var(--cynosure-divider-thickness, 1px)',
  verticalAlign: 'middle',
});

export const dividerSolid = style({});
export const dividerDashed = style({
  selectors: {
    [`${dividerHorizontal}&`]: { borderTopStyle: 'dashed' },
    [`${dividerVertical}&`]: { borderInlineStartStyle: 'dashed' },
  },
});
export const dividerDotted = style({
  selectors: {
    [`${dividerHorizontal}&`]: { borderTopStyle: 'dotted' },
    [`${dividerVertical}&`]: { borderInlineStartStyle: 'dotted' },
  },
});

const softHorizontalMask =
  'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)';
const softVerticalMask =
  'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)';

export const dividerSoft = style({
  selectors: {
    [`${dividerHorizontal}&`]: {
      WebkitMaskImage: softHorizontalMask,
      maskImage: softHorizontalMask,
    },
    [`${dividerVertical}&`]: {
      WebkitMaskImage: softVerticalMask,
      maskImage: softVerticalMask,
    },
  },
});

// ── Labeled (horizontal only) ──────────────────────────────────────────

const ruleBefore = {
  content: '""',
  alignSelf: 'center',
  borderTopStyle: 'solid',
  borderTopColor: 'currentColor',
  borderTopWidth: 'var(--cynosure-divider-thickness, 1px)',
  minWidth: vars.space['4'],
} as const;

export const dividerLabeled = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  margin: 0,
  padding: 0,
  border: 0,
  background: 'transparent',
  '::before': { ...ruleBefore, flex: '1 1 0%' },
  '::after': { ...ruleBefore, flex: '1 1 0%' },
  selectors: {
    [`&${dividerDashed}::before, &${dividerDashed}::after`]: { borderTopStyle: 'dashed' },
    [`&${dividerDotted}::before, &${dividerDotted}::after`]: { borderTopStyle: 'dotted' },
    [`&${dividerSoft}::before`]: {
      WebkitMaskImage: softHorizontalMask,
      maskImage: softHorizontalMask,
    },
    [`&${dividerSoft}::after`]: {
      WebkitMaskImage: softHorizontalMask,
      maskImage: softHorizontalMask,
    },
  },
});

export const dividerLabelAlign = styleVariants({
  start: {
    '::before': { flex: `0 0 ${vars.space['4']}` },
    '::after': { flex: '1 1 0%' },
  },
  center: {
    '::before': { flex: '1 1 0%' },
    '::after': { flex: '1 1 0%' },
  },
  end: {
    '::before': { flex: '1 1 0%' },
    '::after': { flex: `0 0 ${vars.space['4']}` },
  },
});

export const dividerLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  paddingInline: vars.space['3'],
  color: vars.color.foreground.muted,
  fontSize: '0.875rem',
  lineHeight: 1,
  whiteSpace: 'nowrap',
});
