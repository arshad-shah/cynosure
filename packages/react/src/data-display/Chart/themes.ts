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
 * The palette is brand-led: the leading slots are the Cynosure iris/violet
 * harmony you'll recognise from the logo (`#c77dff` → `#8b9dff`), with the
 * semantic colours (success/warning/danger) sitting at the back of the
 * series so they don't compete with the brand identity. The neutral
 * surface/foreground colours mirror `--cynosure-color-{background,foreground,
 * border}-*` exactly — same source the rest of the library reads from
 * `@arshad-shah/cynosure-tokens`. If those tokens move, we move with them.
 */

/* Surface + foreground tokens. Hex values copied verbatim from
 * `tokens/dist/css/{base,dark}.css` so a designer can grep for them in either
 * place and get a hit. */
const tokens = {
  light: {
    /** Transparent so the chart inherits whichever Cynosure surface (page,
     *  card, drawer) it's embedded in — same behaviour as the rest of the
     *  data-display primitives. */
    bg: 'rgba(0,0,0,0)',
    surface: 'rgba(0,0,0,0)',
    grid: '#e4e4e7', // border-default (gray-200)
    text: '#18181b', // foreground-default (gray-900)
    textMuted: '#52525b', // foreground-muted (gray-600)
    axis: '#a1a1aa', // border-strong shifted ½ stop for legibility (gray-400)
    positive: '#16a34a', // feedback-success-solid (green-600)
    negative: '#dc2626', // feedback-danger-solid (red-600)
    onAccent: '#ffffff', // accent-on-solid
  },
  dark: {
    bg: 'rgba(0,0,0,0)',
    surface: 'rgba(0,0,0,0)',
    grid: '#27272a', // border-default (gray-800)
    text: '#fafafa', // foreground-default (gray-50)
    textMuted: '#d4d4d8', // foreground-muted (gray-300)
    axis: '#52525b', // bumped from border-strong (gray-700) for tick legibility
    positive: '#22c55e', // green-500
    negative: '#ef4444', // red-500
    onAccent: '#ffffff',
  },
};

/**
 * Series palette, brand-led. Order matters — chart series are coloured by
 * index, so the first series in any chart picks up the Cynosure accent.
 *
 * Slot 0–2 are the brand harmony (iris → violet → magenta) the logo uses.
 * Slots 3–4 are blue/cyan tints that feel related. The semantic colours
 * (positive green, warning amber, danger red) sit at the tail so they
 * never accidentally override the `positive`/`negative` semantics in
 * Waterfall / Candlestick charts.
 *
 * Light mode picks 600-weights for AA contrast against white surfaces.
 * Dark mode picks 400-weights for AA contrast against gray-900.
 */
const palette = {
  light: [
    '#5663e6', // iris-600 — Cynosure accent (matches `--cynosure-color-accent-solid`)
    '#7c3aed', // violet-600
    '#c77dff', // brand magenta (logo accent dot)
    '#2563eb', // blue-600
    '#0891b2', // cyan-600
    '#16a34a', // green-600
    '#d97706', // amber-600
    '#dc2626', // red-600
  ],
  dark: [
    '#8b9dff', // iris-400 — brand iris (logo)
    '#a78bfa', // violet-400
    '#c77dff', // brand magenta — readable on both light and dark
    '#60a5fa', // blue-400
    '#22d3ee', // cyan-400
    '#4ade80', // green-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
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
