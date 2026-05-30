import { style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/** Root popover shell — wider than the single DatePicker and with room for the rail. */
export const rangePopover = style({
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.xl,
  overflow: 'hidden',
  padding: 0,
  minWidth: 'unset',
  maxHeight: 'unset',
});

/** Horizontal layout: optional rail on the left, calendar area on the right. */
export const rangePopoverInner = style({
  display: 'flex',
});

export const presetRail = style({
  width: '10rem',
  flexShrink: 0,
  padding: `${vars.space['3']} ${vars.space['2']}`,
  borderInlineEnd: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.background.subtle,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  '@media': {
    '(max-width: 639px)': {
      display: 'none',
    },
  },
});

export const presetRailLabel = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  color: vars.color.foreground.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  padding: `${vars.space['1']} ${vars.space['2']} ${vars.space['0.5']}`,
});

export const presetButton = style({
  textAlign: 'left',
  background: 'transparent',
  border: '1px solid transparent',
  cursor: 'pointer',
  padding: `${vars.space['1.5']} ${vars.space['2']}`,
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  transitionProperty: 'background-color, color, box-shadow',
  transitionDuration: vars.duration.fast,
  fontFamily: 'inherit',
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&[data-active="true"]': {
      background: vars.color.background.raised,
      color: vars.color.accent.solid,
      borderColor: vars.color.border.default,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});

export const calendarArea = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

/** Grid that holds the two month bodies side by side. Collapses to one on narrow screens. */
export const monthsGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  '@media': {
    '(max-width: 639px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

/** Used when visibleMonths=2 to hide the second grid on narrow screens. */
export const secondMonth = style({
  '@media': {
    '(max-width: 639px)': {
      display: 'none',
    },
  },
});

export const rangeFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space['2']} ${vars.space['4']}`,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  fontSize: '0.75rem',
  color: vars.color.foreground.subtle,
});

export const kbdHintGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
});

export const kbdChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.6875rem',
  fontWeight: 500,
  color: vars.color.foreground.subtle,
});

export const kbd = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.25rem',
  padding: '1px 4px',
  fontSize: '0.625rem',
  fontWeight: 600,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  color: vars.color.foreground.muted,
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.xs,
});

export const clearLink = style({
  background: 'transparent',
  border: 'none',
  color: vars.color.accent.solid,
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
  padding: `${vars.space['1']} ${vars.space['2']}`,
  borderRadius: vars.radius.sm,
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&:hover': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});
