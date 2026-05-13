import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Shared "inline status surface" recipe used by Alert / Notification /
 * Callout. Each component applies `surfaceRoot` + its own size/padding class +
 * one of the `surfaceVariant×Status` combinations for colour.
 */
export const surfaceRoot = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space['3'],
  borderRadius: vars.radius.md,
  fontFamily: 'var(--cynosure-font-body-md-family)',
  color: vars.color.foreground.default,
  boxSizing: 'border-box',
  position: 'relative',
  border: '1px solid transparent',
});

export const surfaceIcon = style({
  display: 'inline-flex',
  flex: '0 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '0.125rem',
  fontSize: '1.125em',
  lineHeight: 0,
});

export const surfaceClose = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: '1.5rem',
  height: '1.5rem',
  padding: 0,
  marginInlineStart: 'auto',
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  opacity: 0.7,
  cursor: 'pointer',
  borderRadius: vars.radius.sm,
  transitionProperty: 'opacity, background-color, box-shadow',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': { opacity: 1, background: 'rgba(0,0,0,0.06)' },
    '&:focus-visible': {
      outline: 'none',
      opacity: 1,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const surfaceSize = styleVariants({
  sm: { padding: vars.space['2'], fontSize: 'var(--cynosure-font-body-sm-size)' },
  md: { padding: vars.space['3'] },
  lg: { padding: vars.space['4'] },
});

// soft: tinted fill + foreground tokens per status.
export const softInfo = style({
  background: vars.color.feedback.info.soft,
  color: vars.color.feedback.info.foreground,
  borderColor: vars.color.feedback.info.border,
});
export const softSuccess = style({
  background: vars.color.feedback.success.soft,
  color: vars.color.feedback.success.foreground,
  borderColor: vars.color.feedback.success.border,
});
export const softWarning = style({
  background: vars.color.feedback.warning.soft,
  color: vars.color.feedback.warning.foreground,
  borderColor: vars.color.feedback.warning.border,
});
export const softDanger = style({
  background: vars.color.feedback.danger.soft,
  color: vars.color.feedback.danger.foreground,
  borderColor: vars.color.feedback.danger.border,
});

// solid: strong fill for destructive-priority messaging.
export const solidInfo = style({
  background: vars.color.feedback.info.solid,
  color: vars.color.accent.onSolid,
  borderColor: vars.color.feedback.info.solid,
});
export const solidSuccess = style({
  background: vars.color.feedback.success.solid,
  color: vars.color.accent.onSolid,
  borderColor: vars.color.feedback.success.solid,
});
export const solidWarning = style({
  background: vars.color.feedback.warning.solid,
  color: vars.color.accent.onSolid,
  borderColor: vars.color.feedback.warning.solid,
});
export const solidDanger = style({
  background: vars.color.feedback.danger.solid,
  color: vars.color.accent.onSolid,
  borderColor: vars.color.feedback.danger.solid,
});

// outline: border + transparent fill.
export const outlineInfo = style({
  borderColor: vars.color.feedback.info.border,
  color: vars.color.feedback.info.foreground,
});
export const outlineSuccess = style({
  borderColor: vars.color.feedback.success.border,
  color: vars.color.feedback.success.foreground,
});
export const outlineWarning = style({
  borderColor: vars.color.feedback.warning.border,
  color: vars.color.feedback.warning.foreground,
});
export const outlineDanger = style({
  borderColor: vars.color.feedback.danger.border,
  color: vars.color.feedback.danger.foreground,
});

// ghost: foreground only.
export const ghostInfo = style({ color: vars.color.feedback.info.foreground });
export const ghostSuccess = style({ color: vars.color.feedback.success.foreground });
export const ghostWarning = style({ color: vars.color.feedback.warning.foreground });
export const ghostDanger = style({ color: vars.color.feedback.danger.foreground });
