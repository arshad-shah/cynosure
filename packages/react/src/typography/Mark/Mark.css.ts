import { style, styleVariants } from '@vanilla-extract/css';
import { layoutPropsStyle } from '../../primitives/layout/shared/layoutStyle.css.js';
import { vars } from '../../styles/vars.css.js';
import { typographyBase } from '../shared/shared.css.js';

/**
 * Base for every `Mark` variant. Stays an inline flow element so highlights
 * wrap with surrounding text. `box-decoration-break: clone` makes the
 * background + padding repeat on every wrapped line — without it a marker
 * spanning two lines paints corner radius/padding only at the very start
 * and very end, leaving wrapped lines bare.
 *
 * `forced-colors` falls back to the system `Mark`/`MarkText` pair so
 * highlights remain visible when our token palette is overridden by the OS.
 */
export const markBase = style([
  layoutPropsStyle,
  typographyBase,
  {
    vars: { '--cynosure-lp-d-base': 'inline' },
    backgroundColor: 'transparent',
    color: 'inherit',
    borderRadius: vars.radius.xs,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    '@media': {
      '(forced-colors: active)': {
        backgroundColor: 'Mark',
        color: 'MarkText',
        forcedColorAdjust: 'none',
      },
    },
  },
]);

/* ── marker — highlighter-pen background ─────────────────────────── */

export const markerSubtle = styleVariants({
  accent: {
    backgroundColor: vars.color.accent.soft,
    color: vars.color.accent.solid,
    paddingInline: '0.15em',
  },
  success: {
    backgroundColor: vars.color.feedback.success.soft,
    color: vars.color.feedback.success.foreground,
    paddingInline: '0.15em',
  },
  warning: {
    backgroundColor: vars.color.feedback.warning.soft,
    color: vars.color.feedback.warning.foreground,
    paddingInline: '0.15em',
  },
  danger: {
    backgroundColor: vars.color.feedback.danger.soft,
    color: vars.color.feedback.danger.foreground,
    paddingInline: '0.15em',
  },
  info: {
    backgroundColor: vars.color.feedback.info.soft,
    color: vars.color.feedback.info.foreground,
    paddingInline: '0.15em',
  },
  neutral: {
    backgroundColor: vars.color.background.subtle,
    color: vars.color.foreground.default,
    paddingInline: '0.15em',
  },
});

export const markerSolid = styleVariants({
  accent: {
    backgroundColor: vars.color.accent.solid,
    color: vars.color.accent.onSolid,
    paddingInline: '0.15em',
  },
  success: {
    backgroundColor: vars.color.feedback.success.solid,
    color: vars.color.feedback.success.onSolid,
    paddingInline: '0.15em',
  },
  warning: {
    backgroundColor: vars.color.feedback.warning.solid,
    color: vars.color.feedback.warning.onSolid,
    paddingInline: '0.15em',
  },
  danger: {
    backgroundColor: vars.color.feedback.danger.solid,
    color: vars.color.feedback.danger.onSolid,
    paddingInline: '0.15em',
  },
  info: {
    backgroundColor: vars.color.feedback.info.solid,
    color: vars.color.feedback.info.onSolid,
    paddingInline: '0.15em',
  },
  neutral: {
    backgroundColor: vars.color.foreground.muted,
    color: vars.color.background.canvas,
    paddingInline: '0.15em',
  },
});

/* ── chip — pill that flows inline (without Badge's vertical pad) ── */

const chipBase = {
  paddingInline: '0.4em',
  paddingBlock: '0.05em',
  borderRadius: vars.radius.sm,
  fontWeight: vars.font.weight.medium,
} as const;

export const chipSubtle = styleVariants({
  accent: { ...chipBase, backgroundColor: vars.color.accent.soft, color: vars.color.accent.solid },
  success: {
    ...chipBase,
    backgroundColor: vars.color.feedback.success.soft,
    color: vars.color.feedback.success.foreground,
  },
  warning: {
    ...chipBase,
    backgroundColor: vars.color.feedback.warning.soft,
    color: vars.color.feedback.warning.foreground,
  },
  danger: {
    ...chipBase,
    backgroundColor: vars.color.feedback.danger.soft,
    color: vars.color.feedback.danger.foreground,
  },
  info: {
    ...chipBase,
    backgroundColor: vars.color.feedback.info.soft,
    color: vars.color.feedback.info.foreground,
  },
  neutral: {
    ...chipBase,
    backgroundColor: vars.color.background.subtle,
    color: vars.color.foreground.default,
  },
});

export const chipSolid = styleVariants({
  accent: {
    ...chipBase,
    backgroundColor: vars.color.accent.solid,
    color: vars.color.accent.onSolid,
  },
  success: {
    ...chipBase,
    backgroundColor: vars.color.feedback.success.solid,
    color: vars.color.feedback.success.onSolid,
  },
  warning: {
    ...chipBase,
    backgroundColor: vars.color.feedback.warning.solid,
    color: vars.color.feedback.warning.onSolid,
  },
  danger: {
    ...chipBase,
    backgroundColor: vars.color.feedback.danger.solid,
    color: vars.color.feedback.danger.onSolid,
  },
  info: {
    ...chipBase,
    backgroundColor: vars.color.feedback.info.solid,
    color: vars.color.feedback.info.onSolid,
  },
  neutral: {
    ...chipBase,
    backgroundColor: vars.color.foreground.muted,
    color: vars.color.background.canvas,
  },
});

/* ── underline — bold underline, no fill ───────────────────────── */

const underlineBase = {
  backgroundColor: 'transparent',
  textDecorationLine: 'underline',
  textDecorationSkipInk: 'none',
  textUnderlineOffset: '0.18em',
} as const;

export const underlineSubtle = styleVariants({
  accent: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.accent.solid,
    textDecorationThickness: '0.15em',
  },
  success: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.feedback.success.solid,
    textDecorationThickness: '0.15em',
  },
  warning: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.feedback.warning.solid,
    textDecorationThickness: '0.15em',
  },
  danger: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.feedback.danger.solid,
    textDecorationThickness: '0.15em',
  },
  info: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.feedback.info.solid,
    textDecorationThickness: '0.15em',
  },
  neutral: {
    ...underlineBase,
    color: 'inherit',
    textDecorationColor: vars.color.foreground.muted,
    textDecorationThickness: '0.15em',
  },
});

export const underlineSolid = styleVariants({
  accent: {
    ...underlineBase,
    color: vars.color.accent.solid,
    textDecorationColor: vars.color.accent.solid,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
  success: {
    ...underlineBase,
    color: vars.color.feedback.success.foreground,
    textDecorationColor: vars.color.feedback.success.solid,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
  warning: {
    ...underlineBase,
    color: vars.color.feedback.warning.foreground,
    textDecorationColor: vars.color.feedback.warning.solid,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
  danger: {
    ...underlineBase,
    color: vars.color.feedback.danger.foreground,
    textDecorationColor: vars.color.feedback.danger.solid,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
  info: {
    ...underlineBase,
    color: vars.color.feedback.info.foreground,
    textDecorationColor: vars.color.feedback.info.solid,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
  neutral: {
    ...underlineBase,
    color: vars.color.foreground.default,
    textDecorationColor: vars.color.foreground.muted,
    textDecorationThickness: '0.18em',
    fontWeight: vars.font.weight.medium,
  },
});

/* ── bold — colored + bold, no decoration ───────────────────────── */

export const boldSubtle = styleVariants({
  accent: {
    color: vars.color.accent.solid,
    fontWeight: vars.font.weight.semibold,
  },
  success: {
    color: vars.color.feedback.success.foreground,
    fontWeight: vars.font.weight.semibold,
  },
  warning: {
    color: vars.color.feedback.warning.foreground,
    fontWeight: vars.font.weight.semibold,
  },
  danger: {
    color: vars.color.feedback.danger.foreground,
    fontWeight: vars.font.weight.semibold,
  },
  info: {
    color: vars.color.feedback.info.foreground,
    fontWeight: vars.font.weight.semibold,
  },
  neutral: {
    color: vars.color.foreground.default,
    fontWeight: vars.font.weight.semibold,
  },
});

export const boldSolid = styleVariants({
  accent: {
    color: vars.color.accent.solid,
    fontWeight: vars.font.weight.bold,
  },
  success: {
    color: vars.color.feedback.success.solid,
    fontWeight: vars.font.weight.bold,
  },
  warning: {
    color: vars.color.feedback.warning.solid,
    fontWeight: vars.font.weight.bold,
  },
  danger: {
    color: vars.color.feedback.danger.solid,
    fontWeight: vars.font.weight.bold,
  },
  info: {
    color: vars.color.feedback.info.solid,
    fontWeight: vars.font.weight.bold,
  },
  neutral: {
    color: vars.color.foreground.muted,
    fontWeight: vars.font.weight.bold,
  },
});
