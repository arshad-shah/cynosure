import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from '../shared/control.css.js';

/**
 * The "punched card" root for DatePicker / DateRangePicker / TimePicker. No
 * border or background itself — each inner piece is its own inset well, so
 * the field reads as a set of slots stamped into the host surface.
 */
export const pickerRoot = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  gap: vars.space['2'],
  color: vars.color.foreground.default,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  selectors: {
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

/**
 * DatePicker-local well composition: the shared tile + DatePicker's
 * parent-scoped state selectors. Tile chrome is shared with Input.
 */
const wellBase = style([
  fieldWellBase,
  {
    selectors: {
      // variant: filled — deeper recess, border recedes
      [`${pickerRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      // variant: ghost — minimal, no inset shadow, subtle borderless rest state
      [`${pickerRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      // invalid — danger border on every well
      [`${pickerRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      // readonly — slightly deeper well surface
      [`${pickerRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/** The leading-icon pocket — inert, just a visual label. */
export const leadWell = style([
  wellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    width: '2.5rem',
    color: vars.color.foreground.subtle,
    cursor: 'default',
    pointerEvents: 'none',
  },
]);

/** The date-segment pocket — flexes to fill, lifts on focus. */
export const segsWell = style([
  wellBase,
  {
    flex: 1,
    minWidth: 0,
    paddingInline: vars.space['3'],
    cursor: 'text',
    selectors: {
      '&:focus-within': {
        background: vars.color.background.surface,
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      [`${pickerRoot}[data-invalid="true"] &:focus-within`]: {
        borderColor: vars.color.feedback.danger.border,
        boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
      },
      // ghost variant: the well appears only on focus
      [`${pickerRoot}[data-variant="ghost"] &:focus-within`]: {
        background: vars.color.background.surface,
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
    },
  },
]);

/** The open-popover chevron button pocket — interactive, accent-tinted hover. */
export const triggerWell = style([
  wellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    width: '2.5rem',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: vars.color.foreground.muted,
    outline: 'none',
    selectors: {
      '&:hover:not(:disabled):not([data-disabled])': {
        background: vars.color.accent.soft,
        borderColor: vars.color.accent.solid,
        color: vars.color.accent.solid,
      },
      '&[data-pressed]': {
        background: vars.color.accent.soft,
        borderColor: vars.color.accent.solid,
        color: vars.color.accent.solid,
      },
      '&:focus-visible': {
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      '&:disabled, &[data-disabled]': {
        cursor: 'not-allowed',
      },
    },
  },
]);

/** The DateInput that owns the segments — just a flex line, no chrome. */
export const dateSegments = style({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  minHeight: '1.5rem',
  color: 'inherit',
  font: 'inherit',
  cursor: 'text',
  fontVariantNumeric: 'tabular-nums',
});

/** One date segment (day / month / year / hour / minute). */
export const segment = style({
  display: 'inline-block',
  paddingInline: '2px',
  paddingBlock: '1px',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  outline: 'none',
  borderRadius: vars.radius.xs,
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  selectors: {
    '&[data-placeholder]': {
      color: vars.color.foreground.subtle,
    },
    '&[data-focused]': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&[data-disabled]': {
      color: vars.color.foreground.disabled,
    },
  },
});

/** Arrow separator between the start/end segment wells in DateRangePicker. */
export const rangeSeparator = style({
  flex: '0 0 auto',
  display: 'inline-flex',
  alignItems: 'center',
  color: vars.color.foreground.subtle,
});

/** Calendar popover shell. */
export const calendarPopover = style({
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.xl,
  overflow: 'hidden',
  padding: 0,
  minWidth: 'unset',
  maxHeight: 'unset',
  width: '18rem',
});

/** "Today is …" footer row below the calendar. */
export const calendarFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space['2']} ${vars.space['4']}`,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  fontSize: '0.75rem',
  color: vars.color.foreground.subtle,
});

export const calendarFooterTodayLabel = style({
  fontWeight: 500,
});

export const calendarFooterTodayValue = style({
  color: vars.color.foreground.default,
  fontWeight: 600,
});

export const goToTodayLink = style({
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
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
