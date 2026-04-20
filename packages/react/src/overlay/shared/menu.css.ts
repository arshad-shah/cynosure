import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const menuIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const menuOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
});

/** Shared content shell — DropdownMenu, ContextMenu, MenuBar, sub-menus. */
export const menuContent = style({
  minWidth: '12rem',
  maxHeight: 'min(60vh, 20rem)',
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 12px 32px -8px rgba(0,0,0,0.18)',
  overflow: 'auto',
  padding: vars.space['1.5'],
  zIndex: Number(vars.z.dropdown),
  outline: 'none',
  selectors: {
    '&[data-side="bottom"]': { transformOrigin: 'top center' },
    '&[data-side="top"]': { transformOrigin: 'bottom center' },
    '&[data-side="left"]': { transformOrigin: 'center right' },
    '&[data-side="right"]': { transformOrigin: 'center left' },
    '&[data-state="open"]': {
      animation: `${menuIn} ${vars.duration.fast} ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${menuOut} ${vars.duration.fast} ease-in`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

/** One item — MenuItem, CheckboxItem, RadioItem, SubTrigger. */
export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  position: 'relative',
  paddingBlock: vars.space['2'],
  paddingInline: vars.space['2'],
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  color: vars.color.foreground.default,
  outline: 'none',
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  transition: 'background-color 120ms ease, color 120ms ease',
  selectors: {
    '&[data-highlighted]': {
      background: vars.color.accent.soft,
      color: vars.color.foreground.default,
    },
    '&[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    '&[data-variant="danger"]': {
      color: vars.color.feedback.danger.solid,
    },
    '&[data-variant="danger"][data-highlighted]': {
      background: vars.color.feedback.danger.soft,
      color: vars.color.feedback.danger.solid,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

/** Legacy inline-start indicator — kept exported for back-compat; unused by the kit. */
export const menuIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/** Chevron at the inline-end edge of SubTrigger. */
export const menuSubChevron = style({
  marginInlineStart: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
});

/** Horizontal rule separator. */
export const menuSeparator = style({
  height: '1px',
  background: vars.color.border.subtle,
  marginBlock: vars.space['1'],
  marginInline: vars.space['1'],
});

/** Section label (non-interactive). */
export const menuLabel = style({
  paddingInlineEnd: vars.space['2'],
  paddingInlineStart: `calc(${vars.space['2']} + 1.25rem + ${vars.space['2']})`,
  paddingBlock: vars.space['1'],
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontWeight: 600,
  color: vars.color.foreground.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

/** Keyboard shortcut chip rendered at the inline-end of an item. */
export const menuShortcut = style({
  marginInlineStart: 'auto',
  paddingInline: vars.space['1'],
  paddingBlock: '0',
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.xs,
  lineHeight: '1.5',
});

export const menubarRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['0.5'],
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: vars.space['0.5'],
});

export const menubarTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  paddingBlock: vars.space['1'],
  paddingInline: vars.space['2'],
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.default,
  borderRadius: vars.radius.sm,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  selectors: {
    '&[data-highlighted], &[data-state="open"]': {
      background: vars.color.accent.soft,
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});
