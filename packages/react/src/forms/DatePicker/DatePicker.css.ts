import { style } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from '../shared/control.css.js';
import { segmentedTrack } from '../shared/segmented.css.js';

/**
 * The segmented-track root for DatePicker / DateRangePicker / TimePicker —
 * the shared tinted track (subtle well, hairline border, 4px padding/gap)
 * wrapping the raised well tiles, the same container `NumberInput` and
 * `Input` use. The focus ring and invalid tint live here on the track;
 * variants retint the track only.
 */
export const pickerRoot = style([
  segmentedTrack,
  {
    width: '100%',
    color: vars.color.foreground.default,
    fontSize: vars.font.body.md.size,
    lineHeight: vars.font.body.md.lineHeight,
    selectors: {
      // Variants first, states after — equal specificity, so source order
      // lets the focus/invalid borders win over the variant's border reset.
      '&[data-variant="filled"]': {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      '&[data-variant="ghost"]': {
        background: 'transparent',
        borderColor: 'transparent',
      },
      '&:focus-within:not([data-invalid="true"])': {
        borderColor: vars.color.border.focus,
        boxShadow: focusRing,
      },
      '&[data-invalid="true"]': {
        borderColor: vars.color.feedback.danger.border,
      },
      '&[data-invalid="true"]:focus-within': {
        boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
      },
      '&[data-readonly="true"]': {
        background: vars.color.background.muted,
      },
      '&[data-disabled="true"]': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
  },
]);

/**
 * DatePicker-local well composition: the shared raised tile + DatePicker's
 * parent-scoped state selectors. Tile chrome is shared with Input.
 */
const wellBase = style([
  fieldWellBase,
  {
    selectors: {
      // variant: ghost — tiles sit flat on the transparent track
      [`${pickerRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        boxShadow: 'none',
      },
      // invalid — danger border on every well
      [`${pickerRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
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

/**
 * The date-segment tile — flexes to fill. The focus ring lives on the track
 * (`pickerRoot:focus-within`), like `NumberInput`; the ghost variant raises
 * the tile back up while editing.
 */
export const segsWell = style([
  wellBase,
  {
    flex: 1,
    minWidth: 0,
    paddingInline: vars.space['3'],
    cursor: 'text',
    selectors: {
      [`${pickerRoot}[data-variant="ghost"] &:focus-within`]: {
        background: vars.color.background.raised,
        boxShadow: vars.shadow.xs,
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
        boxShadow: focusRing,
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
  // Scroll the calendar rather than overflowing a short viewport, and never
  // exceed the screen width on a narrow phone.
  overflow: 'auto',
  padding: 0,
  minWidth: 'unset',
  maxWidth: 'calc(100vw - 1rem)',
  maxHeight: 'calc(100dvh - 1rem)',
  // Size to the calendar's intrinsic width instead of pinning a fixed `18rem`.
  // The month grid is 7 fixed 2.25rem cells + 3px border-spacing + side padding
  // (~19rem), so a hard `18rem` was ~12px too narrow and the `overflow: auto`
  // surfaced a permanent horizontal scrollbar. `fit-content` hugs the grid (and
  // the wider dual-month layout) exactly, while `maxWidth` still caps it on a
  // narrow phone where `overflow: auto` legitimately takes over.
  width: 'fit-content',
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
      boxShadow: focusRing,
    },
  },
});
