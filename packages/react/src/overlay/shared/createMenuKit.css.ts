import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/** Fixed-width leading slot — absorbs icons, check/radio indicators, or blank space. */
export const menuLeadingSlot = style({
  flex: '0 0 auto',
  width: '1.25rem',
  height: '1.25rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'currentColor',
});

/** Label + description vertical stack; takes all remaining space and shrinks before siblings. */
export const menuLabelStack = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: '1 1 auto',
  gap: '2px',
  overflow: 'hidden',
});

/** Primary label line — truncates with ellipsis before pushing the shortcut off the edge. */
export const menuLabelText = style({
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/** Muted second-line description. */
export const menuDescription = style({
  fontSize: 'var(--cynosure-font-body-xs-size)',
  lineHeight: 'var(--cynosure-font-body-xs-line-height)',
  color: vars.color.foreground.muted,
});

/**
 * Wraps a nested `<Checkbox>` / `<Radio>` visual inside a menu item's leading
 * slot. The form control itself is purely decorative inside a menuitem —
 * the outer Radix menu item owns keyboard + click interaction — so this
 * wrapper disables the inner control's pointer events. Positioned relatively
 * so that a `<RadixItemIndicator>` can stack a checked-state overlay on top.
 */
export const menuFormIndicator = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  width: '1.125rem',
  height: '1.125rem',
});

/**
 * Absolute-positioned overlay rendered by Radix's `ItemIndicator` when the
 * parent menu item is checked. Sits on top of the always-rendered unchecked
 * visual so the Checkbox/Radio component itself shows both states.
 */
export const menuFormIndicatorOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Makes a wrapping `<RadixRadioGroup.Root>` layout-transparent so the nested
 * `<Radio>` (which must live inside a RadixRadioGroup context) positions
 * exactly at the flex center rather than nested inside an extra div.
 */
export const menuFormIndicatorGroup = style({
  display: 'contents',
});

/** Animated down-chevron on DropdownMenuTriggerButton. */
export const triggerChevron = style({
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'transform 160ms cubic-bezier(0.2, 0, 0, 1)',
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
