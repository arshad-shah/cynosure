import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const paletteIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, calc(-50% - 6px))' },
  to: { opacity: 1, transform: 'translate(-50%, -50%)' },
});

const paletteOut = keyframes({
  from: { opacity: 1, transform: 'translate(-50%, -50%)' },
  to: { opacity: 0, transform: 'translate(-50%, calc(-50% - 6px))' },
});

/**
 * The dialog-level shell. Positioned top-center-ish (top 22% feels right for
 * ⌘K on large screens) and drops to a fuller sheet on mobile. Height grows
 * with content but never dwarfs the viewport.
 */
export const paletteContent = style({
  position: 'fixed',
  top: '22%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100vw - 2rem)',
  maxWidth: '40rem',
  maxHeight: 'min(70vh, 32rem)',
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow['2xl'],
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  zIndex: Number(vars.z.modal),
  selectors: {
    '&[data-state="open"]': {
      animation: `${paletteIn} ${vars.duration.fast} ${vars.easing.easeOut}`,
    },
    '&[data-state="closed"]': {
      animation: `${paletteOut} ${vars.duration.fast} ${vars.easing.easeIn}`,
    },
  },
  '@media': {
    '(max-width: 640px)': {
      top: '10%',
      maxWidth: 'none',
    },
  },
});

export const paletteInputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  paddingInline: vars.space['4'],
  height: '3.25rem',
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  flexShrink: 0,
});

export const paletteInputIcon = style({
  color: vars.color.foreground.muted,
  display: 'inline-flex',
  alignItems: 'center',
});

export const paletteInput = style({
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.foreground.default,
  font: 'inherit',
  fontSize: 'var(--cynosure-font-body-lg-size)',
  lineHeight: 'var(--cynosure-font-body-lg-line-height)',
  padding: 0,
  '::placeholder': {
    color: vars.color.foreground.subtle,
  },
});

export const paletteKbdHint = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5rem',
  paddingInline: '6px',
  height: '1.375rem',
  borderRadius: vars.radius.sm,
  background: vars.color.background.subtle,
  color: vars.color.foreground.muted,
  border: `1px solid ${vars.color.border.default}`,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  flexShrink: 0,
});

/** The scrollable list body. */
export const paletteList = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: vars.space['2'],
  scrollPaddingBlock: vars.space['2'],
});

export const paletteEmpty = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['1'],
  padding: `${vars.space['10']} ${vars.space['4']}`,
  color: vars.color.foreground.muted,
  fontSize: 'var(--cynosure-font-body-md-size)',
  textAlign: 'center',
});

export const paletteLoading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['2'],
  padding: `${vars.space['6']} ${vars.space['4']}`,
  color: vars.color.foreground.muted,
  fontSize: 'var(--cynosure-font-body-sm-size)',
});

export const paletteGroup = style({
  display: 'flex',
  flexDirection: 'column',
  selectors: {
    '& + &': {
      marginTop: vars.space['2'],
    },
  },
});

// cmdk renders the heading element with the `[cmdk-group-heading]` attribute;
// style it globally (scoped to our `paletteGroup`) so consumers don't have to
// thread a className through the `heading` prop.
globalStyle(`${paletteGroup} [cmdk-group-heading]`, {
  paddingInline: vars.space['3'],
  paddingBlock: vars.space['1'],
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: vars.color.foreground.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
});

/**
 * Single selectable row. cmdk sets `data-selected` on the active item; we
 * also style `data-disabled` so disabled items stay reachable by screen
 * readers but visually recede.
 */
export const paletteItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  paddingInline: vars.space['3'],
  paddingBlock: vars.space['2'],
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  color: vars.color.foreground.default,
  fontSize: 'var(--cynosure-font-body-md-size)',
  lineHeight: 'var(--cynosure-font-body-md-line-height)',
  userSelect: 'none',
  transitionProperty: 'background-color, color',
  transitionDuration: vars.duration.fast,
  outline: 'none',
  selectors: {
    '&[data-selected="true"]': {
      background: vars.color.accent.soft,
      color: vars.color.accent.solidHover,
    },
    '&[data-disabled="true"]': {
      opacity: 0.45,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const paletteItemIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  color: vars.color.foreground.muted,
  flexShrink: 0,
  selectors: {
    [`${paletteItem}[data-selected="true"] &`]: {
      color: vars.color.accent.solid,
    },
  },
});

export const paletteItemBody = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const paletteItemLabel = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 500,
});

export const paletteItemDescription = style({
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const paletteItemShortcut = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
  color: vars.color.foreground.muted,
  fontSize: '0.75rem',
});

export const paletteSeparator = style({
  height: 1,
  margin: `${vars.space['2']} 0`,
  background: vars.color.border.subtle,
  border: 'none',
});

export const paletteFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
  paddingInline: vars.space['3'],
  paddingBlock: vars.space['2'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.background.subtle,
  fontSize: '0.75rem',
  color: vars.color.foreground.subtle,
  flexShrink: 0,
});

export const paletteFooterHints = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3'],
});

export const paletteFooterHint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});
