import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const popoverIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const popoverOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-4px)' },
});

/** Shared popover shell for Select / Combobox / MultiSelect / DatePicker. */
export const popover = style({
  minWidth: 'var(--trigger-width)',
  maxHeight: 'min(60vh, 20rem)',
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.xl,
  overflow: 'auto',
  padding: vars.space['1'],
  zIndex: Number(vars.z.popover),
  selectors: {
    '&[data-entering]': {
      animation: `${popoverIn} ${vars.duration.fast} ease-out`,
    },
    '&[data-exiting]': {
      animation: `${popoverOut} ${vars.duration.fast} ease-in`,
    },
  },
});

/** Listbox container rendered inside the popover shell. */
export const listbox = style({
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
});

/** One option inside a listbox (ListBoxItem / ComboboxItem / SelectItem). */
export const listboxItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  paddingBlock: vars.space['2'],
  paddingInline: vars.space['3'],
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  color: vars.color.foreground.default,
  outline: 'none',
  fontSize: 'var(--lumen-font-body-md-size)',
  lineHeight: 'var(--lumen-font-body-md-line-height)',
  selectors: {
    '&[data-hovered], &[data-focused]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-selected]': {
      background: vars.color.accent.solid,
      color: vars.color.accent.onSolid,
    },
    '&[data-focus-visible]': {
      boxShadow: `inset 0 0 0 2px ${vars.color.accent.ring}`,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

/** Section wrapper for grouped options (SelectSection, ComboboxSection). */
export const listboxSection = style({
  display: 'flex',
  flexDirection: 'column',
  paddingBlock: vars.space['1'],
  selectors: {
    '& + &': {
      borderTop: `1px solid ${vars.color.border.subtle}`,
      marginTop: vars.space['1'],
      paddingTop: vars.space['2'],
    },
  },
});

/** Section heading label. */
export const listboxSectionHeader = style({
  paddingInline: vars.space['2'],
  paddingBlock: vars.space['1'],
  fontSize: 'var(--lumen-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

/** Empty / "no results" state. */
export const listboxEmpty = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space['4'],
  fontSize: 'var(--lumen-font-body-md-size)',
  color: vars.color.foreground.muted,
});
