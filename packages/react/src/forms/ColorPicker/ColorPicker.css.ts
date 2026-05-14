import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { inertWell } from '../Input/Input.css.js';

const checkerBg = `
  linear-gradient(45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(-45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, ${vars.color.border.subtle} 75%),
  linear-gradient(-45deg, transparent 75%, ${vars.color.border.subtle} 75%)
`;

export const ALPHA_CHECKER = `repeating-conic-gradient(${vars.color.border.subtle} 0% 25%, ${vars.color.background.surface} 0% 50%) 0 0 / 12px 12px`;

/* ---------- focus visual (shared) ---------- */
export const focusRing = style({
  outline: 'none',
  selectors: {
    '&:focus-visible, &[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});

/* ---------- trigger ---------- */
export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[1]} ${vars.space[2]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  cursor: 'pointer',
  color: vars.color.foreground.default,
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible, &[data-focus-visible]': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const triggerIconOnly = style({
  padding: vars.space[1],
  gap: 0,
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

/* ---------- panel container ---------- */
export const contentWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: vars.space[3],
});

export const contentWrapBySize = styleVariants({
  sm: { width: '15rem', padding: vars.space[3], gap: vars.space[2] },
  md: { width: '18rem', padding: vars.space[3], gap: vars.space[3] },
  lg: { width: '22rem', padding: vars.space[4], gap: vars.space[3] },
});

export const inlinePanel = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  boxShadow: vars.shadow.xs,
});

/* ---------- hero strip ---------- */
export const hero = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[2]}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.muted,
  border: `1px solid ${vars.color.border.subtle}`,
});

export const heroChip = style({
  flexShrink: 0,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border.subtle}`,
  overflow: 'hidden',
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
});

export const heroChipBySize = styleVariants({
  sm: { width: '2rem', height: '2rem' },
  md: { width: '2.375rem', height: '2.375rem' },
  lg: { width: '2.75rem', height: '2.75rem' },
});

export const heroMeta = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

export const heroHex = style({
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.foreground.default,
  letterSpacing: '0.01em',
});

export const heroHexBySize = styleVariants({
  sm: { fontSize: 'var(--cynosure-font-body-sm-size)' },
  md: { fontSize: 'var(--cynosure-font-body-md-size)' },
  lg: { fontSize: 'var(--cynosure-font-body-lg-size)' },
});

export const heroReadout = style({
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
  marginTop: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/* ---------- area ---------- */
export const area = style({
  position: 'relative',
  width: '100%',
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  touchAction: 'none',
  cursor: 'crosshair',
  boxShadow: `inset 0 0 0 1px ${vars.color.border.subtle}`,
});

export const areaBySize = styleVariants({
  sm: { height: '8rem' },
  md: { height: '10rem' },
  lg: { height: '13rem' },
});

export const areaThumb = style({
  border: `2px solid ${vars.color.background.surface}`,
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 1px 3px rgba(0,0,0,0.3)`,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 3px rgba(0,0,0,0.3)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const areaThumbBySize = styleVariants({
  sm: { width: '0.875rem', height: '0.875rem' },
  md: { width: '1rem', height: '1rem' },
  lg: { width: '1.125rem', height: '1.125rem' },
});

/* ---------- sliders ---------- */
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
  border: `2px solid ${vars.color.background.surface}`,
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 1px 3px rgba(0,0,0,0.25)`,
  background: vars.color.background.surface,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 3px rgba(0,0,0,0.25)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const sliderThumbBySize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.125rem', height: '1.125rem' },
  lg: { width: '1.25rem', height: '1.25rem' },
});

/* ---------- legacy single-field (back-compat) ---------- */
/** @deprecated Retained only for consumers passing custom `children`. */
export const field = style({
  width: '100%',
  padding: `${vars.space['1.5']} ${vars.space[2]}`,
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

/* ---------- format toolbar ---------- */
export const formatStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
});

export const formatToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2],
});

export const formatToolbarActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
});

/* ---------- channel cells ---------- */
export const cellsRow = style({
  display: 'grid',
  gap: vars.space['1.5'],
});

export const cellsRowCols = styleVariants({
  1: { gridTemplateColumns: '1fr' },
  3: { gridTemplateColumns: 'repeat(3, 1fr)' },
  4: { gridTemplateColumns: 'repeat(3, 1fr) 1.35fr' },
});

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

export const cellSize = styleVariants({
  sm: { minHeight: '1.625rem', fontSize: '0.75rem' },
  md: { minHeight: '1.875rem', fontSize: '0.8125rem' },
  lg: { minHeight: '2.125rem', fontSize: '0.875rem' },
});

export const cellSlot = style([
  inertWell,
  {
    border: 'none',
    background: 'transparent',
    boxShadow: 'none',
    padding: 0,
    minWidth: 0,
    minHeight: 0,
    width: '1.25em',
    flex: '0 0 1.25em',
    justifyContent: 'flex-start',
    paddingInline: vars.space[1],
    overflow: 'visible',
  },
]);

export const cellInput = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  minHeight: 0,
  paddingInline: 0,
  textAlign: 'left',
  fontWeight: 600,
  fontFeatureSettings: '"tnum" 1',
});

/**
 * Field-well override inside a channel cell. Strips Input's well chrome
 * (border/bg/shadow) since the outer `cellRoot` owns the framing.
 */
export const cellFieldWell = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  paddingInline: 0,
  minHeight: 0,
});

export const cellGlyph = style({
  fontFamily: 'var(--cynosure-font-mono-md-family, monospace)',
  fontSize: '0.95em',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: vars.color.foreground.muted,
});

/* ---------- swatches ---------- */
export const swatchSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
  paddingTop: vars.space[2],
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

export const swatchLabel = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.foreground.subtle,
});

export const swatchGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1.5'],
  border: 'none',
  padding: 0,
  margin: 0,
});

export const swatchTile = style({
  borderRadius: vars.radius.sm,
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

export const swatchTileActive = style({
  borderColor: vars.color.accent.solid,
  boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
});

export const swatchTileBySize = styleVariants({
  sm: { width: '1.25rem', height: '1.25rem' },
  md: { width: '1.5rem', height: '1.5rem' },
  lg: { width: '1.75rem', height: '1.75rem' },
});

export const swatchAddTile = style({
  background: 'transparent',
  backgroundImage: 'none',
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.subtle,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong, color: vars.color.foreground.default },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});
