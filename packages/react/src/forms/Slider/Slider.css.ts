import { style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
  width: '100%',
});

export const headerRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
});

export const valueLabel = style({
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

export const track = style({
  position: 'relative',
  width: '100%',
  background: vars.color.background.muted,
  borderRadius: vars.radius.full,
  selectors: {
    '&[data-disabled]': {
      opacity: 0.5,
    },
  },
});

export const trackSize = styleVariants({
  sm: { height: '4px' },
  md: { height: '6px' },
  lg: { height: '8px' },
});

export const fill = style({
  position: 'absolute',
  height: '100%',
  background: vars.color.accent.solid,
  borderRadius: vars.radius.full,
});

export const thumb = style({
  width: '1rem',
  height: '1rem',
  borderRadius: vars.radius.full,
  background: vars.color.accent.solid,
  border: `2px solid ${vars.color.background.surface}`,
  boxShadow: vars.shadow.sm,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-dragging]': {
      cursor: 'grabbing',
    },
    '&[data-focus-visible]': {
      boxShadow: focusRing,
    },
    '&[data-disabled]': {
      cursor: 'not-allowed',
    },
  },
});

export const marksRow = style({
  position: 'relative',
  width: '100%',
  height: '0.75rem',
});

/**
 * Per-mark wrapper. Absolutely positioned at the mark's percentage along the
 * track (`insetInlineStart` set inline); the dot + label center on its origin
 * via `translateX(-50%)`. Without `position: absolute` here the inline offset
 * is ignored and every mark collapses to the track's start.
 */
export const markWrap = style({
  position: 'absolute',
  top: 0,
});

export const markDot = style({
  position: 'absolute',
  top: 0,
  transform: 'translateX(-50%)',
  width: '3px',
  height: '3px',
  borderRadius: vars.radius.full,
  background: vars.color.border.strong,
});

export const markLabel = style({
  position: 'absolute',
  top: '0.5rem',
  transform: 'translateX(-50%)',
  fontSize: vars.font.body.sm.size,
  color: vars.color.foreground.muted,
  whiteSpace: 'nowrap',
});
