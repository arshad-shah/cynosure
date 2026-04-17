import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const badgeRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  fontFamily: 'var(--lumen-font-body-md-family)',
  fontWeight: 'var(--lumen-font-weight-medium)',
  lineHeight: 1,
  userSelect: 'none',
  border: '1px solid transparent',
});

export const badgeSize = styleVariants({
  xs: {
    fontSize: 'var(--lumen-font-body-xs-size)',
    paddingInline: vars.space['1'],
    paddingBlock: '0.125rem',
    minHeight: '1rem',
  },
  sm: {
    fontSize: 'var(--lumen-font-body-xs-size)',
    paddingInline: vars.space['1.5'],
    paddingBlock: '0.1875rem',
    minHeight: '1.25rem',
  },
  md: {
    fontSize: 'var(--lumen-font-body-sm-size)',
    paddingInline: vars.space['2'],
    paddingBlock: vars.space['0.5'],
    minHeight: '1.5rem',
  },
});

export const badgeShape = styleVariants({
  default: { borderRadius: vars.radius.sm },
  pill: { borderRadius: vars.radius.full },
  square: { borderRadius: vars.radius.none },
});

// Solid variants — filled pill with high-contrast foreground.
export const solidAccent = style({
  background: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
});
export const solidNeutral = style({
  background: vars.color.foreground.default,
  color: vars.color.background.surface,
});
export const solidSuccess = style({
  background: vars.color.feedback.success.solid,
  color: vars.color.accent.onSolid,
});
export const solidWarning = style({
  background: vars.color.feedback.warning.solid,
  color: vars.color.accent.onSolid,
});
export const solidDanger = style({
  background: vars.color.feedback.danger.solid,
  color: vars.color.accent.onSolid,
});
export const solidInfo = style({
  background: vars.color.feedback.info.solid,
  color: vars.color.accent.onSolid,
});

// Soft variants — tinted background + foreground.
export const softAccent = style({
  background: vars.color.accent.soft,
  color: vars.color.accent.solid,
});
export const softNeutral = style({
  background: vars.color.background.muted,
  color: vars.color.foreground.default,
});
export const softSuccess = style({
  background: vars.color.feedback.success.soft,
  color: vars.color.feedback.success.foreground,
});
export const softWarning = style({
  background: vars.color.feedback.warning.soft,
  color: vars.color.feedback.warning.foreground,
});
export const softDanger = style({
  background: vars.color.feedback.danger.soft,
  color: vars.color.feedback.danger.foreground,
});
export const softInfo = style({
  background: vars.color.feedback.info.soft,
  color: vars.color.feedback.info.foreground,
});

// Outline — border + transparent fill.
export const outlineAccent = style({
  borderColor: vars.color.accent.solid,
  color: vars.color.accent.solid,
});
export const outlineNeutral = style({
  borderColor: vars.color.border.default,
  color: vars.color.foreground.default,
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
export const outlineInfo = style({
  borderColor: vars.color.feedback.info.border,
  color: vars.color.feedback.info.foreground,
});

// Ghost — foreground only.
export const ghostAccent = style({ color: vars.color.accent.solid });
export const ghostNeutral = style({ color: vars.color.foreground.muted });
export const ghostSuccess = style({ color: vars.color.feedback.success.foreground });
export const ghostWarning = style({ color: vars.color.feedback.warning.foreground });
export const ghostDanger = style({ color: vars.color.feedback.danger.foreground });
export const ghostInfo = style({ color: vars.color.feedback.info.foreground });

export const badgeIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  fontSize: '0.875em',
  lineHeight: 0,
});

/** Bare coloured dot (no text content). */
export const badgeDot = style({
  display: 'inline-block',
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: vars.radius.full,
  padding: 0,
  border: 'none',
  minHeight: 0,
});

export const badgeDotSize = styleVariants({
  xs: { width: '0.375rem', height: '0.375rem' },
  sm: { width: '0.5rem', height: '0.5rem' },
  md: { width: '0.625rem', height: '0.625rem' },
});
