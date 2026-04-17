import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * sonner ships its own CSS; we re-skin it by passing `toastOptions.classNames`.
 * The rules below piggy-back on the data attributes sonner sets on each toast.
 */

export const toastBase = style({
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['3'],
  fontFamily: 'var(--lumen-font-body-md-family)',
});

export const toastTitle = style({
  fontWeight: 'var(--lumen-font-weight-medium)',
  fontSize: 'var(--lumen-font-body-md-size)',
  lineHeight: 'var(--lumen-font-body-md-line-height)',
  color: vars.color.foreground.default,
});

export const toastDescription = style({
  fontSize: 'var(--lumen-font-body-sm-size)',
  lineHeight: 'var(--lumen-font-body-sm-line-height)',
  color: vars.color.foreground.muted,
});

export const toastActionButton = style({
  background: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: 'var(--lumen-font-body-sm-size)',
  cursor: 'pointer',
});

export const toastCancelButton = style({
  background: 'transparent',
  color: vars.color.foreground.muted,
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border.default}`,
  fontSize: 'var(--lumen-font-body-sm-size)',
  cursor: 'pointer',
});

export const toastSuccess = style({
  borderColor: vars.color.feedback.success.border,
  background: vars.color.feedback.success.soft,
  color: vars.color.feedback.success.foreground,
});

export const toastError = style({
  borderColor: vars.color.feedback.danger.border,
  background: vars.color.feedback.danger.soft,
  color: vars.color.feedback.danger.foreground,
});

export const toastWarning = style({
  borderColor: vars.color.feedback.warning.border,
  background: vars.color.feedback.warning.soft,
  color: vars.color.feedback.warning.foreground,
});

export const toastInfo = style({
  borderColor: vars.color.feedback.info.border,
  background: vars.color.feedback.info.soft,
  color: vars.color.feedback.info.foreground,
});
