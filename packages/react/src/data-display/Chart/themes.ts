import { addTheme } from '@arshad-shah/swift-chart';

/**
 * Cynosure-flavoured SwiftChart themes.
 *
 * SwiftChart paints onto Canvas 2D, which can't resolve `var(--…)` references
 * at draw time. There are two layers here:
 *
 *  1. **Live resolution (preferred).** {@link resolveChartTheme} reads the
 *     `--cynosure-chart-*` custom properties off a chart's container with
 *     `getComputedStyle` and builds a concrete `Theme`. Those properties are
 *     declared in `Chart.css.ts` as references to Cynosure tokens, so the
 *     chart automatically follows whatever theme is active — light, dark,
 *     `terminal`, `high-contrast`, or a consumer's own custom theme. Override
 *     a single slot (e.g. `--cynosure-chart-3`) on any ancestor and the chart
 *     picks it up on the next repaint.
 *
 *  2. **Static fallback.** When computed styles aren't available — server
 *     rendering, the first paint before the stylesheet applies, or a slot the
 *     consumer hasn't defined — we fall back to the two materialised `Theme`
 *     objects below. They're also registered with SwiftChart's `addTheme` API
 *     as `'cynosure-light'` / `'cynosure-dark'` so they can be referenced by
 *     name anywhere SwiftChart accepts a theme.
 *
 * The static values mirror the resolved default-theme tokens exactly, so the
 * fallback is visually identical to the live read for the built-in themes.
 */

type Scheme = 'light' | 'dark';

/** SwiftChart `Theme`-shaped object. Kept local to avoid a type import churn. */
export interface ChartThemeObject {
  bg: string;
  surface: string;
  grid: string;
  text: string;
  textMuted: string;
  axis: string;
  positive: string;
  negative: string;
  onAccent: string;
  colors: string[];
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

/**
 * Series palette, brand-led — mirrors `--cynosure-color-chart-{1..8}`. Order
 * matters: chart series are coloured by index, so the first series picks up the
 * Cynosure iris accent. Light mode uses 600-weights for AA contrast on white;
 * dark mode uses 400-weights for AA contrast on gray-900. The semantic
 * green/amber/red sit at the tail so they never override the `positive` /
 * `negative` semantics used by waterfall / candlestick charts.
 */
const palette: Record<Scheme, string[]> = {
  light: ['#5663e6', '#7c3aed', '#c77dff', '#2563eb', '#0891b2', '#16a34a', '#d97706', '#dc2626'],
  dark: ['#8b9dff', '#a78bfa', '#c77dff', '#60a5fa', '#22d3ee', '#4ade80', '#fbbf24', '#f87171'],
};

const cynosureLight: ChartThemeObject = {
  // Transparent so the chart inherits whichever Cynosure surface (page, card,
  // drawer) it's embedded in — same behaviour as the rest of data-display.
  bg: 'rgba(0,0,0,0)',
  surface: 'rgba(0,0,0,0)',
  grid: '#e4e4e7', // border-default (gray-200)
  text: '#18181b', // foreground-default (gray-900)
  textMuted: '#52525b', // foreground-muted (gray-600)
  axis: '#d4d4d8', // border-strong (gray-300)
  positive: '#16a34a', // feedback-success-solid (green-600)
  negative: '#dc2626', // feedback-danger-solid (red-600)
  onAccent: '#ffffff', // foreground-on-accent
  colors: palette.light,
  tooltipBg: '#ffffff', // background-raised
  tooltipBorder: '#e4e4e7', // border-default
  tooltipText: '#18181b', // foreground-default
};

const cynosureDark: ChartThemeObject = {
  bg: 'rgba(0,0,0,0)',
  surface: 'rgba(0,0,0,0)',
  grid: '#27272a', // border-default (gray-800)
  text: '#fafafa', // foreground-default (gray-50)
  textMuted: '#d4d4d8', // foreground-muted (gray-300)
  axis: '#3f3f46', // border-strong (gray-700)
  positive: '#22c55e', // feedback-success-solid (green-500)
  negative: '#ef4444', // feedback-danger-solid (red-500)
  onAccent: '#ffffff',
  colors: palette.dark,
  tooltipBg: '#27272a', // background-raised (gray-800)
  tooltipBorder: '#27272a', // border-default (gray-800)
  tooltipText: '#fafafa', // foreground-default (gray-50)
};

const fallback: Record<Scheme, ChartThemeObject> = {
  light: cynosureLight,
  dark: cynosureDark,
};

/** Single-value `--cynosure-chart-*` slots, mapped to their `Theme` field. */
const SCALAR_SLOTS = [
  ['bg', '--cynosure-chart-bg'],
  ['surface', '--cynosure-chart-surface'],
  ['grid', '--cynosure-chart-grid'],
  ['axis', '--cynosure-chart-axis'],
  ['text', '--cynosure-chart-text'],
  ['textMuted', '--cynosure-chart-text-muted'],
  ['positive', '--cynosure-chart-positive'],
  ['negative', '--cynosure-chart-negative'],
  ['onAccent', '--cynosure-chart-on-accent'],
  ['tooltipBg', '--cynosure-chart-tooltip-bg'],
  ['tooltipBorder', '--cynosure-chart-tooltip-border'],
  ['tooltipText', '--cynosure-chart-tooltip-text'],
] as const satisfies ReadonlyArray<readonly [keyof ChartThemeObject, string]>;

/** Series palette property names, in paint order. */
const SERIES_SLOTS = [
  '--cynosure-chart-1',
  '--cynosure-chart-2',
  '--cynosure-chart-3',
  '--cynosure-chart-4',
  '--cynosure-chart-5',
  '--cynosure-chart-6',
  '--cynosure-chart-7',
  '--cynosure-chart-8',
] as const;

/**
 * Build a concrete SwiftChart `Theme` from the `--cynosure-chart-*` custom
 * properties on `element` (falling back to `<html>`), so the chart matches the
 * live theme. Any slot the platform can't resolve falls back to the static
 * `scheme` theme, so the result is always complete.
 */
export function resolveChartTheme(
  element: Element | null | undefined,
  scheme: Scheme,
): ChartThemeObject {
  const base = fallback[scheme];
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') return base;

  const target = element ?? document.documentElement;
  const cs = getComputedStyle(target);
  const read = (name: string): string => {
    // Prefer the resolved computed value; fall back to an inline override on
    // the element (the path real browsers won't need, but keeps things robust
    // where computed custom-property resolution is unavailable).
    const computed = cs.getPropertyValue(name).trim();
    if (computed) return computed;
    const inline = (target as HTMLElement).style?.getPropertyValue?.(name)?.trim();
    return inline ?? '';
  };

  const out = { ...base } as ChartThemeObject;
  for (const [field, varName] of SCALAR_SLOTS) {
    const value = read(varName);
    if (value) (out[field] as string) = value;
  }
  out.colors = SERIES_SLOTS.map((varName, i) => read(varName) || base.colors[i] || '#888888');
  return out;
}

let registered = false;

/**
 * Register both static Cynosure themes with SwiftChart. Safe to call
 * repeatedly — `addTheme` is a map-set, and we no-op after the first call to
 * keep the work off the render path.
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

/** The materialised static `Theme` objects, in case a consumer wants to extend them. */
export const cynosureChartThemes = {
  light: cynosureLight,
  dark: cynosureDark,
} as const;
