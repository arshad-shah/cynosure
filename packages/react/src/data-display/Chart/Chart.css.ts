import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Chart container. Sets themed defaults for every SVG element Recharts can
 * render — `currentColor`-keyed axes, dashed grid lines, muted text — so
 * consumers can drop any `<LineChart>` / `<BarChart>` / `<AreaChart>` inside
 * and get a consistent look without configuring every prop.
 */
export const chartContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  color: vars.color.foreground.default,
  fontSize: 'var(--cynosure-font-body-sm-size)',
  fontVariantNumeric: 'tabular-nums',
  // CSS variables that drive the themed SVG defaults below. Override any of
  // these on the container to theme a single chart differently.
  vars: {
    '--cynosure-chart-grid': vars.color.border.subtle,
    '--cynosure-chart-axis': vars.color.border.default,
    '--cynosure-chart-tick': vars.color.foreground.subtle,
    '--cynosure-chart-label': vars.color.foreground.muted,
    '--cynosure-chart-cursor': vars.color.accent.soft,
  },
});

// Recharts emits a fixed set of classes on the SVG primitives. Style them
// globally, scoped to our `chartContainer`, so consumers don't have to
// configure every axis / grid / tooltip prop by hand.
globalStyle(`${chartContainer} .recharts-cartesian-grid line`, {
  stroke: 'var(--cynosure-chart-grid)',
  strokeDasharray: '3 3',
});

globalStyle(`${chartContainer} .recharts-cartesian-axis-line`, {
  stroke: 'var(--cynosure-chart-axis)',
});

globalStyle(`${chartContainer} .recharts-cartesian-axis-tick-line`, {
  stroke: 'var(--cynosure-chart-axis)',
  opacity: 0.5,
});

globalStyle(`${chartContainer} .recharts-cartesian-axis-tick-value`, {
  fill: 'var(--cynosure-chart-tick)',
  fontSize: '0.75rem',
});

globalStyle(
  `${chartContainer} .recharts-polar-grid-concentric-polygon, ${chartContainer} .recharts-polar-grid-concentric-circle`,
  {
    stroke: 'var(--cynosure-chart-grid)',
    strokeDasharray: '3 3',
  },
);

globalStyle(`${chartContainer} .recharts-polar-angle-axis-tick-value`, {
  fill: 'var(--cynosure-chart-tick)',
  fontSize: '0.75rem',
});

globalStyle(`${chartContainer} .recharts-label`, {
  fill: 'var(--cynosure-chart-label)',
});

globalStyle(`${chartContainer} .recharts-legend-item-text`, {
  color: `${vars.color.foreground.default} !important`,
});

globalStyle(`${chartContainer} .recharts-reference-line line`, {
  stroke: vars.color.foreground.muted,
  strokeDasharray: '4 4',
  opacity: 0.6,
});

globalStyle(`${chartContainer} .recharts-tooltip-cursor`, {
  fill: 'var(--cynosure-chart-cursor)',
  opacity: 0.45,
});

/** The floating tooltip card — renders above bars/points/segments. */
export const chartTooltip = style({
  minWidth: '10rem',
  background: vars.color.background.raised,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['2'],
  fontSize: 'var(--cynosure-font-body-sm-size)',
  pointerEvents: 'none',
});

export const chartTooltipLabel = style({
  marginBottom: vars.space['1'],
  color: vars.color.foreground.muted,
  fontWeight: 500,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const chartTooltipRows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['0.5'],
});

export const chartTooltipRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['3'],
});

export const chartTooltipName = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  color: vars.color.foreground.muted,
});

export const chartTooltipSwatch = style({
  width: '0.625rem',
  height: '0.625rem',
  borderRadius: vars.radius.xs,
  flexShrink: 0,
});

export const chartTooltipValue = style({
  color: vars.color.foreground.default,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
});

export const chartLegend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['3'],
  marginTop: vars.space['2'],
  alignItems: 'center',
  justifyContent: 'center',
});

export const chartLegendItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2'],
  fontSize: '0.75rem',
  color: vars.color.foreground.muted,
  cursor: 'default',
  selectors: {
    '&[data-interactive="true"]': {
      cursor: 'pointer',
    },
    '&[data-hidden="true"]': {
      opacity: 0.4,
    },
  },
});

export const chartLegendSwatch = style({
  width: '0.625rem',
  height: '0.625rem',
  borderRadius: vars.radius.xs,
  flexShrink: 0,
});
