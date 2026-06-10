import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * The chart theme contract, expressed as CSS custom properties.
 *
 * SwiftChart paints onto a `<canvas>`, which can't read `var(--…)` at draw
 * time — so `Chart.tsx` reads these custom properties off the container with
 * `getComputedStyle` and materialises a concrete SwiftChart `Theme` object.
 *
 * Mapping each chart colour to a Cynosure token here (rather than hard-coding
 * hex in JS) means the charts follow whatever theme is active — light, dark,
 * `terminal`, `high-contrast`, or a consumer's own custom theme. Override any
 * single slot by setting the corresponding `--cynosure-chart-*` property on an
 * ancestor (or via the chart's `style` prop) without touching the rest.
 *
 * Declaring them through `var()` references also keeps the referenced tokens in
 * the trimmed zero-config `all.css` bundle (see `tsup.config.ts`), so the
 * values resolve at runtime even for consumers who never import the raw tokens.
 */
export const chartThemeVars = {
  /** Page + plot-area fill. Transparent so the chart inherits its surface. */
  '--cynosure-chart-bg': 'transparent',
  '--cynosure-chart-surface': 'transparent',
  '--cynosure-chart-grid': vars.color.border.default,
  '--cynosure-chart-axis': vars.color.border.strong,
  '--cynosure-chart-text': vars.color.foreground.default,
  '--cynosure-chart-text-muted': vars.color.foreground.muted,
  '--cynosure-chart-positive': vars.color.feedback.success.solid,
  '--cynosure-chart-negative': vars.color.feedback.danger.solid,
  '--cynosure-chart-on-accent': vars.color.foreground.onAccent,
  '--cynosure-chart-tooltip-bg': vars.color.background.raised,
  '--cynosure-chart-tooltip-border': vars.color.border.default,
  '--cynosure-chart-tooltip-text': vars.color.foreground.default,
  '--cynosure-chart-1': vars.color.chart['1'],
  '--cynosure-chart-2': vars.color.chart['2'],
  '--cynosure-chart-3': vars.color.chart['3'],
  '--cynosure-chart-4': vars.color.chart['4'],
  '--cynosure-chart-5': vars.color.chart['5'],
  '--cynosure-chart-6': vars.color.chart['6'],
  '--cynosure-chart-7': vars.color.chart['7'],
  '--cynosure-chart-8': vars.color.chart['8'],
} as const;

/**
 * Cynosure chart wrapper. Provides:
 *   - sizing (consumers typically set `aspectRatio` or `height` via prop)
 *   - tabular numerics so tooltip values line up
 *   - a transparent backdrop so the chart inherits the surrounding card /
 *     section background
 *   - the `--cynosure-chart-*` theme contract that `Chart.tsx` reads back.
 */
export const chartContainer = style({
  vars: chartThemeVars,
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  color: vars.color.foreground.default,
  fontVariantNumeric: 'tabular-nums',
  background: 'transparent',
});
