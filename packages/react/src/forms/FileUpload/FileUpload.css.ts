import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

const dropZoneBase = style({
  display: 'flex',
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  outline: 'none',
  transition: `border-color ${vars.duration.fast}, background-color ${vars.duration.fast}, box-shadow ${vars.duration.fast}`,
  selectors: {
    '&[data-over="true"]': {
      borderColor: vars.color.accent.solid,
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      borderColor: vars.color.border.focus,
      boxShadow: focusRing,
    },
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
});

export const dropZoneVariants = styleVariants({
  default: [
    dropZoneBase,
    {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: vars.space['2'],
      padding: vars.space['8'],
      border: `2px dashed ${vars.color.border.default}`,
      borderRadius: vars.radius.lg,
      background: vars.color.background.surface,
    },
  ],
  card: [
    dropZoneBase,
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: vars.space['3'],
      padding: vars.space['4'],
      border: `1px solid ${vars.color.border.subtle}`,
      borderRadius: vars.radius.lg,
      background: vars.color.background.surface,
    },
  ],
  compact: [
    dropZoneBase,
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: vars.space['2'],
      padding: `${vars.space['2']} ${vars.space['3']}`,
      border: `1.5px dashed ${vars.color.border.default}`,
      borderRadius: vars.radius.md,
      background: vars.color.background.surface,
    },
  ],
  minimal: [
    dropZoneBase,
    {
      display: 'inline-flex',
      alignItems: 'center',
      gap: vars.space['2'],
      padding: `${vars.space['2']} ${vars.space['3']}`,
      border: `1px dashed ${vars.color.border.default}`,
      borderRadius: vars.radius.md,
      background: vars.color.background.surface,
      color: vars.color.foreground.default,
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  ],
});

// Soft-tinted circular icon used in the `default` variant.
export const iconCircle = style({
  width: '3rem',
  height: '3rem',
  borderRadius: vars.radius.full,
  background: vars.color.accent.soft,
  color: vars.color.accent.solid,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

// Rounded tile icon used in the `card` variant.
export const iconTile = style({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: vars.radius.md,
  background: vars.color.accent.soft,
  color: vars.color.accent.solid,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

// Small neutral icon for the `compact` variant.
export const iconInline = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.foreground.muted,
  flexShrink: 0,
});

// "or" divider between title and browse button in the `default` variant.
export const orDivider = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  fontSize: '0.75rem',
  color: vars.color.foreground.subtle,
  selectors: {
    '&::before, &::after': {
      content: '""',
      display: 'block',
      width: '2rem',
      height: '1px',
      background: vars.color.border.subtle,
    },
  },
});

// Zero out UA list defaults — Stack handles layout.
export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

// Row wrapper — richer border, hover lift. `width: 100%` makes the `<li>`
// fill the list (the underlying `Inline` is inline-flex and would otherwise
// shrink to its content, leaving the actions hugging the text on the left).
export const row = style({
  width: '100%',
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  transition: `border-color ${vars.duration.fast}`,
  selectors: {
    '&:hover': {
      borderColor: vars.color.border.default,
    },
  },
});

// Trailing action cluster (preview / remove) — pinned to the inline-end edge
// so it sits at the right of the row regardless of the middle column's growth.
export const rowActions = style({
  marginInlineStart: 'auto',
});

export const thumbnail = style({
  width: '2.75rem',
  height: '2.75rem',
  borderRadius: vars.radius.md,
  objectFit: 'cover',
  background: vars.color.background.muted,
  flexShrink: 0,
  display: 'block',
});

// Doc-style tile for non-image files: houses the extension Badge centered.
export const thumbnailDoc = style({
  width: '2.75rem',
  height: '2.75rem',
  borderRadius: vars.radius.md,
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.subtle}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

// Fallback icon-filled thumbnail when the file has no extension.
export const thumbnailIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.foreground.muted,
});

// Tabular numerals for sizes so digits align column-wise as files are added.
export const fileSize = style({
  fontVariantNumeric: 'tabular-nums',
});

// Small dot separator between size chip and type descriptor.
export const metaDot = style({
  width: '2px',
  height: '2px',
  borderRadius: vars.radius.full,
  background: vars.color.border.default,
  display: 'inline-block',
  flexShrink: 0,
});

// Red-on-hover modifier for the remove IconButton's ghost styling.
export const removeButton = style({
  selectors: {
    '&:hover': {
      color: vars.color.feedback.danger.foreground,
      background: vars.color.feedback.danger.soft,
    },
  },
});
