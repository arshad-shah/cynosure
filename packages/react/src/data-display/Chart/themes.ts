import { addTheme } from '@arshad-shah/swift-chart';

/**
 * Cynosure-flavoured SwiftChart themes.
 *
 * SwiftChart paints onto Canvas 2D, which can't resolve `var(--…)` references.
 * Instead of routing CSS custom properties at draw time, we materialise two
 * concrete `Theme` objects from the design tokens, then register them with
 * SwiftChart so consumers can reference them by name (`'cynosure-light'`,
 * `'cynosure-dark'`) anywhere SwiftChart accepts a theme.
 *
 * The colour palette is the Cynosure semantic ramp (iris accent + the
 * feedback colours) — same source the rest of the library reads from
 * `@arshad-shah/cynosure-tokens`. If those tokens move, we move with them.
 */

/* Surface + foreground tokens, light mode (matches `tokens/dist/css/base.css`). */
const tokens = {
  light: {
    bg: '#ffffff', // background-surface
    surface: '#fafafa', // background-canvas (subtle inset behind the plot)
    grid: '#e4e4e7', // border-default
    gridSubtle: '#f4f4f5', // border-subtle
    text: '#18181b', // foreground-default
    textMuted: '#52525b', // foreground-muted
    axis: '#d4d4d8', // border-strong
    positive: '#16a34a', // feedback-success-solid (green-600)
    negative: '#dc2626', // feedback-danger-solid (red-600)
    onAccent: '#ffffff', // accent-on-solid
  },
  dark: {
    bg: '#18181b', // background-surface
    surface: '#27272a', // background-raised
    grid: '#27272a', // border-default
    gridSubtle: '#1f1f22',
    text: '#fafafa', // foreground-default
    textMuted: '#d4d4d8', // foreground-muted
    axis: '#3f3f46', // border-strong
    positive: '#22c55e', // green-500
    negative: '#ef4444', // red-500
    onAccent: '#ffffff',
  },
};

/**
 * The series palette. Tuned for: (1) good contrast against both light and
 * dark Cynosure surfaces, (2) ≥3:1 distinguishability between adjacent
 * series, (3) a deliberate first-colour match with `--cynosure-color-accent`.
 *
 * The light palette uses 600-weight, the dark palette uses 400-weight so each
 * surface gets the strongest contrast. Order is the same in both so a chart
 * keyed by series index reads identically across themes.
 */
const palette = {
  light: [
    '#5663e6', // iris-600  (Cynosure accent)
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#d97706', // amber-600
    '#dc2626', // red-600
    '#7c3aed', // violet-600
    '#0891b2', // cyan-600 (slot for additional series)
    '#db2777', // pink-600
  ],
  dark: [
    '#8b9dff', // iris-400
    '#60a5fa', // blue-400
    '#4ade80', // green-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
    '#a78bfa', // violet-400
    '#22d3ee', // cyan-400
    '#f472b6', // pink-400
  ],
};

const cynosureLight = {
  bg: tokens.light.bg,
  surface: tokens.light.surface,
  grid: tokens.light.grid,
  text: tokens.light.text,
  textMuted: tokens.light.textMuted,
  axis: tokens.light.axis,
  positive: tokens.light.positive,
  negative: tokens.light.negative,
  onAccent: tokens.light.onAccent,
  colors: palette.light,
};

const cynosureDark = {
  bg: tokens.dark.bg,
  surface: tokens.dark.surface,
  grid: tokens.dark.grid,
  text: tokens.dark.text,
  textMuted: tokens.dark.textMuted,
  axis: tokens.dark.axis,
  positive: tokens.dark.positive,
  negative: tokens.dark.negative,
  onAccent: tokens.dark.onAccent,
  colors: palette.dark,
};

let registered = false;

/**
 * Register both Cynosure themes with SwiftChart. Safe to call repeatedly —
 * SwiftChart's `addTheme` is just a map-set under the hood and we no-op
 * after the first call to keep the work off the render path.
 */
export function registerCynosureThemes(): void {
  if (registered) return;
  addTheme('cynosure-light', cynosureLight);
  addTheme('cynosure-dark', cynosureDark);
  registered = true;
}

/** Theme names registered above. Pass these wherever SwiftChart accepts a theme. */
export const CYNOSURE_THEME_LIGHT = 'cynosure-light';
export const CYNOSURE_THEME_DARK = 'cynosure-dark';

/** The materialised `Theme` objects, in case a consumer wants to extend them. */
export const cynosureChartThemes = {
  light: cynosureLight,
  dark: cynosureDark,
} as const;
