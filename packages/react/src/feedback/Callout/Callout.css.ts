import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const calloutRoot = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space['3'],
  padding: vars.space['4'],
  borderRadius: vars.radius.md,
  borderInlineStart: `3px solid ${vars.color.accent.solid}`,
  background: vars.color.background.subtle,
  color: vars.color.foreground.default,
  fontFamily: vars.font.body.md.family,
  lineHeight: vars.font.body.md.lineHeight,
});

export const calloutVariantOutline = style({
  background: 'transparent',
  border: `1px solid ${vars.color.border.default}`,
  borderInlineStart: `3px solid ${vars.color.accent.solid}`,
});

export const calloutColorScheme = styleVariants({
  accent: {
    background: vars.color.accent.soft,
    borderInlineStartColor: vars.color.accent.solid,
    color: vars.color.accent.solid,
  },
  neutral: {
    background: vars.color.background.subtle,
    borderInlineStartColor: vars.color.foreground.muted,
    color: vars.color.foreground.default,
  },
  success: {
    background: vars.color.feedback.success.soft,
    borderInlineStartColor: vars.color.feedback.success.solid,
    color: vars.color.feedback.success.foreground,
  },
  warning: {
    background: vars.color.feedback.warning.soft,
    borderInlineStartColor: vars.color.feedback.warning.solid,
    color: vars.color.feedback.warning.foreground,
  },
  danger: {
    background: vars.color.feedback.danger.soft,
    borderInlineStartColor: vars.color.feedback.danger.solid,
    color: vars.color.feedback.danger.foreground,
  },
});

export const calloutOutlineColorScheme = styleVariants({
  accent: { borderInlineStartColor: vars.color.accent.solid, color: vars.color.accent.solid },
  neutral: {
    borderInlineStartColor: vars.color.foreground.muted,
    color: vars.color.foreground.default,
  },
  success: {
    borderInlineStartColor: vars.color.feedback.success.solid,
    color: vars.color.feedback.success.foreground,
  },
  warning: {
    borderInlineStartColor: vars.color.feedback.warning.solid,
    color: vars.color.feedback.warning.foreground,
  },
  danger: {
    borderInlineStartColor: vars.color.feedback.danger.solid,
    color: vars.color.feedback.danger.foreground,
  },
});

export const calloutIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  marginTop: '0.125rem',
  fontSize: '1.125em',
  lineHeight: 0,
});

export const calloutBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
  flex: '1 1 auto',
  minWidth: 0,
});

export const calloutTitle = style({
  margin: 0,
  fontWeight: vars.font.weight.semibold,
  fontSize: vars.font.body.md.size,
});

export const calloutContent = style({
  margin: 0,
  fontSize: vars.font.body.md.size,
  color: 'inherit',
});
