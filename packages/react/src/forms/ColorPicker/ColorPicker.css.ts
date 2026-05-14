import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const checkerBg = `
  linear-gradient(45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(-45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, ${vars.color.border.subtle} 75%),
  linear-gradient(-45deg, transparent 75%, ${vars.color.border.subtle} 75%)
`;

/**
 * Checker layer composable into an inline style — used by the alpha slider so
 * the transparent portion of RAC's color gradient reveals a checker beneath.
 */
export const ALPHA_CHECKER = `repeating-conic-gradient(${vars.color.border.subtle} 0% 25%, ${vars.color.background.surface} 0% 50%) 0 0 / 12px 12px`;

export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  padding: `${vars.space['1']} ${vars.space['2']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  cursor: 'pointer',
  color: vars.color.foreground.default,
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const swatch = style({
  display: 'inline-block',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border.subtle}`,
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
});

/** Shared body container — size-specific width via `contentWrapBySize`. */
export const contentWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  padding: vars.space['3'],
});

export const contentWrapBySize = styleVariants({
  sm: { width: '15rem' },
  md: { width: '18rem' },
  lg: { width: '22rem' },
});

/** Inline variant wrapper — adds the surface chrome the popover would normally provide. */
export const inlinePanel = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  boxShadow: vars.shadow.xs,
});

export const area = style({
  position: 'relative',
  width: '100%',
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  touchAction: 'none',
  cursor: 'crosshair',
});

export const areaBySize = styleVariants({
  sm: { height: '8rem' },
  md: { height: '10rem' },
  lg: { height: '13rem' },
});

export const areaThumb = style({
  border: '2px solid white',
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.default}, 0 1px 2px rgba(0,0,0,0.2)`,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 2px rgba(0,0,0,0.2)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const areaThumbBySize = styleVariants({
  sm: { width: '0.875rem', height: '0.875rem' },
  md: { width: '1rem', height: '1rem' },
  lg: { width: '1.125rem', height: '1.125rem' },
});

export const slider = style({
  position: 'relative',
  width: '100%',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border.subtle}`,
  touchAction: 'none',
  cursor: 'pointer',
});

export const sliderBySize = styleVariants({
  sm: { height: '0.75rem' },
  md: { height: '1rem' },
  lg: { height: '1.125rem' },
});

export const sliderThumb = style({
  top: '50%',
  border: '2px solid white',
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.default}, 0 1px 2px rgba(0,0,0,0.2)`,
  background: 'transparent',
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 2px rgba(0,0,0,0.2)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const sliderThumbBySize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.125rem', height: '1.125rem' },
  lg: { width: '1.25rem', height: '1.25rem' },
});

/** Legacy single-field style retained for back-compat with custom `children`. */
export const field = style({
  width: '100%',
  padding: `${vars.space['1.5']} ${vars.space['2']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  font: 'inherit',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

/** Format section — segmented toggle row above the cell grid. */
export const formatStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
});

/** Toolbar row: format toggle on the left, action buttons on the right. */
export const formatToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['2'],
});

export const formatToolbarActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1'],
});

/** Cells row — auto-fits N cells across the body width. */
export const cellsRow = style({
  display: 'grid',
  gap: vars.space['1.5'],
});

export const cellsRowCols = styleVariants({
  1: { gridTemplateColumns: '1fr' },
  3: { gridTemplateColumns: 'repeat(3, 1fr)' },
  4: { gridTemplateColumns: 'repeat(4, 1fr)' },
});

/**
 * Cell-scoped root override. Drops the gap between wells and gives the
 * outer container the border/background, so the channel cell reads as a
 * single bordered tile with slot regions inside (rather than three separate
 * bordered wells side-by-side).
 */
export const cellRoot = style({
  gap: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  overflow: 'hidden',
  transition: 'border-color 120ms, box-shadow 120ms',
  selectors: {
    '&[data-hover="true"]': { borderColor: vars.color.border.strong },
    '&:focus-within': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

/** Per-size container height + body font. */
export const cellSize = styleVariants({
  sm: { minHeight: '1.625rem', fontSize: '0.75rem' },
  md: { minHeight: '1.875rem', fontSize: '0.8125rem' },
  lg: { minHeight: '2.125rem', fontSize: '0.875rem' },
});

/**
 * Field-well override — strips Input's chrome (border, bg, shadow, padding)
 * because the outer `cellRoot` now owns those. Field-well only contributes
 * `flex: 1; min-width: 0;` from the base class, which is what we want.
 */
export const cellFieldWell = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  paddingInline: 0,
  minHeight: 0,
});

/** Inert-slot override — same chrome strip + a tight, minimum footprint. */
export const cellSlot = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  paddingInline: vars.space['1'],
  minWidth: 0,
  minHeight: 0,
});

/** Center the channel value inside the cell's fieldWell with tabular figures. */
export const cellInput = style({
  textAlign: 'center',
  fontFeatureSettings: '"tnum" 1',
  paddingInline: 0,
});

/** Mono prefix/suffix glyph rendered inside an inert slot. */
export const cellGlyph = style({
  fontFamily: 'var(--cynosure-font-mono-md-family, monospace)',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: vars.color.foreground.subtle,
});

/** Each swatch in the saved-colors grid. */
export const swatchTile = style({
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border.subtle}`,
  padding: 0,
  cursor: 'pointer',
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});

export const swatchTileBySize = styleVariants({
  sm: { width: '1.25rem', height: '1.25rem' },
  md: { width: '1.5rem', height: '1.5rem' },
  lg: { width: '1.75rem', height: '1.75rem' },
});

export const swatchGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1.5'],
});

/**
 * Shared focus visual for picker controls. Apply as an additional class so the
 * element's own border/background stays under its control.
 */
export const focusRing = style({
  outline: 'none',
  selectors: {
    '&:focus-visible, &[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});
