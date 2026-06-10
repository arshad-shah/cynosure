import {
  type ChartRef,
  Area as SwiftArea,
  Bar as SwiftBar,
  Boxplot as SwiftBoxplot,
  Bubble as SwiftBubble,
  Bullet as SwiftBullet,
  Candlestick as SwiftCandlestick,
  Combo as SwiftCombo,
  Donut as SwiftDonut,
  Funnel as SwiftFunnel,
  Gauge as SwiftGauge,
  HBar as SwiftHBar,
  Heatmap as SwiftHeatmap,
  Line as SwiftLine,
  Marimekko as SwiftMarimekko,
  Network as SwiftNetwork,
  Pie as SwiftPie,
  Radar as SwiftRadar,
  RadialBar as SwiftRadialBar,
  Sankey as SwiftSankey,
  Scatter as SwiftScatter,
  SparklineComponent as SwiftSparkline,
  StackedArea as SwiftStackedArea,
  StackedBar as SwiftStackedBar,
  Treemap as SwiftTreemap,
  Waterfall as SwiftWaterfall,
} from '@arshad-shah/swift-chart/react';
import {
  type CSSProperties,
  type ComponentProps,
  type ReactElement,
  type Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect.js';
import { cn } from '../../utils/cn.js';
import { chartContainer } from './Chart.css.js';
import {
  CYNOSURE_THEME_DARK,
  CYNOSURE_THEME_LIGHT,
  registerCynosureThemes,
  resolveChartTheme,
} from './themes.js';

/**
 * Cynosure charts follow the active Cynosure theme automatically. Each wrapper
 * reads the `--cynosure-chart-*` custom properties (declared in `Chart.css.ts`
 * as references to Cynosure tokens) off its container and materialises a
 * SwiftChart `Theme` from them — so light, dark, `terminal`, `high-contrast`
 * and consumer custom themes all flow through to the canvas with no extra
 * configuration. Before the stylesheet resolves (SSR / first paint) the
 * statically-registered `'cynosure-light'` / `'cynosure-dark'` themes stand in.
 *
 * Need a completely different palette? Pass `theme` directly — any value
 * SwiftChart accepts (built-in name, registered name, or full `Theme` object)
 * is forwarded untouched and always wins over the auto-resolved theme.
 */
registerCynosureThemes();

/** Re-export the theme registration helpers for app-level `addTheme` extensions. */
export {
  CYNOSURE_THEME_DARK,
  CYNOSURE_THEME_LIGHT,
  cynosureChartThemes,
  registerCynosureThemes,
  resolveChartTheme,
} from './themes.js';

/** Re-export the SwiftChart imperative ref so consumers can call `.resize()` / `.toDataURL()`. */
export type { ChartRef } from '@arshad-shah/swift-chart/react';

type SchemeName = 'light' | 'dark';

/**
 * Resolve the current color scheme from the document. We check, in order:
 *   1. `<html data-theme="dark|light">` — Cynosure's `ThemeProvider` writes this.
 *   2. The CSS `color-scheme` computed value on `<html>`.
 *   3. The `prefers-color-scheme` media query.
 */
function readScheme(): SchemeName {
  if (typeof document === 'undefined') return 'light';
  const root = document.documentElement;
  const dataTheme = root.dataset.theme;
  if (dataTheme === 'dark' || dataTheme === 'light') return dataTheme;
  const computed = getComputedStyle(root).colorScheme;
  if (computed?.includes('dark') && !computed.includes('light')) return 'dark';
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

interface ThemeSignal {
  scheme: SchemeName;
  /** Bumped on every theme-affecting mutation so consumers re-resolve even
   *  when a theme swap keeps the same light/dark scheme (e.g. `terminal`). */
  version: number;
}

/**
 * Track theme changes from every source `readScheme` checks. Unlike a plain
 * scheme subscription, `version` increments on *any* observed change — so a
 * custom theme swap that keeps the same scheme still triggers a re-resolve.
 */
function useThemeSignal(): ThemeSignal {
  const [signal, setSignal] = useState<ThemeSignal>(() => ({ scheme: readScheme(), version: 0 }));

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setSignal((prev) => ({ scheme: readScheme(), version: prev.version + 1 }));

    // 1. `data-theme` / `class` / inline `--cynosure-chart-*` flips on <html>.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    // 2. System preference change.
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', update);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', update);
    };
  }, []);

  return signal;
}

/**
 * Resolve the SwiftChart theme for a chart. An explicit `theme` always wins.
 * Otherwise we start from the statically-registered named theme (SSR-safe) and,
 * once mounted, swap to a concrete `Theme` materialised from the container's
 * live `--cynosure-chart-*` custom properties.
 */
function useResolvedTheme(
  containerRef: React.RefObject<HTMLElement | null>,
  theme: unknown,
): unknown {
  const { scheme, version } = useThemeSignal();
  const [resolved, setResolved] = useState<unknown>(
    () => theme ?? (readScheme() === 'dark' ? CYNOSURE_THEME_DARK : CYNOSURE_THEME_LIGHT),
  );

  useIsomorphicLayoutEffect(() => {
    if (theme !== undefined) {
      setResolved(theme);
      return;
    }
    setResolved(resolveChartTheme(containerRef.current, scheme));
  }, [theme, scheme, version, containerRef]);

  return resolved;
}

/**
 * Props shared by every Cynosure chart wrapper. Controls how the chart's
 * sized container is laid out around the underlying SwiftChart canvas.
 */
interface BaseProps {
  /** Additional class applied to the sized wrapper around the SwiftChart canvas. */
  className?: string;
  /** Additional inline styles merged onto the wrapper. */
  style?: CSSProperties;
  /**
   * Aspect ratio for the wrapper. Accepts any CSS `aspect-ratio` value (e.g.
   * `"16 / 9"`, `"4/3"`) or a number (`1.78`). Ignored when `height` is set.
   * @default "16 / 9"
   */
  aspectRatio?: string | number;
  /**
   * Fixed pixel/CSS height. When set, takes precedence over `aspectRatio`.
   * Pass a number (interpreted as `px`) or any CSS length string.
   */
  height?: number | string;
  /**
   * Minimum height applied to the wrapper — keeps the canvas from collapsing
   * inside flex/grid parents that don't define an intrinsic height.
   * @default 220
   */
  minHeight?: number | string;
}

function useWrapperStyle({
  aspectRatio = '16 / 9',
  height,
  minHeight = 220,
  style,
}: BaseProps): CSSProperties {
  return useMemo<CSSProperties>(
    () =>
      height !== undefined
        ? { height, minHeight, ...style }
        : {
            aspectRatio: typeof aspectRatio === 'number' ? String(aspectRatio) : aspectRatio,
            minHeight,
            ...style,
          },
    [aspectRatio, height, minHeight, style],
  );
}

/**
 * A short, stable key for a resolved theme so SwiftChart fully repaints when
 * the theme changes (re-using the same canvas would draw new colours over old).
 */
function themeKey(theme: unknown): string {
  if (typeof theme === 'string') return theme;
  if (theme && typeof theme === 'object') {
    const t = theme as { colors?: unknown[]; text?: string };
    return `obj:${t.text ?? ''}:${(t.colors ?? []).join(',')}`;
  }
  return 'custom';
}

/**
 * Wraps a SwiftChart React component in a sized container that exposes the
 * `--cynosure-chart-*` theme contract, then feeds back the resolved Cynosure
 * theme. Consumer `theme` always wins.
 */
function createChart<P extends { theme?: unknown }>(
  Component: React.ForwardRefExoticComponent<P & React.RefAttributes<ChartRef>>,
) {
  return forwardRef<ChartRef, P & BaseProps>(function ThemedChart(props, ref) {
    const { className, style, aspectRatio, height, minHeight, theme, ...rest } = props as P &
      BaseProps;

    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperStyle = useWrapperStyle({ aspectRatio, height, minHeight, style });
    const resolvedTheme = useResolvedTheme(containerRef, theme);

    const merged = {
      ...rest,
      theme: resolvedTheme,
      width: '100%',
      height: '100%',
    } as unknown as P & React.RefAttributes<ChartRef>;

    return (
      <div ref={containerRef} className={cn(chartContainer, className)} style={wrapperStyle}>
        <Component key={themeKey(resolvedTheme)} ref={ref as Ref<ChartRef>} {...merged} />
      </div>
    );
  });
}

// Re-export each component's props (sans ref) under a Cynosure-flavoured name
// + the shared `BaseProps`. TS otherwise refuses to emit the .d.ts because the
// inferred wrapper-props reference unexported names from `@arshad-shah/swift-chart/react`.
export type LineChartProps = ComponentProps<typeof SwiftLine> & BaseProps;
export type AreaChartProps = ComponentProps<typeof SwiftArea> & BaseProps;
export type BarChartProps = ComponentProps<typeof SwiftBar> & BaseProps;
export type HBarChartProps = ComponentProps<typeof SwiftHBar> & BaseProps;
export type StackedBarChartProps = ComponentProps<typeof SwiftStackedBar> & BaseProps;
export type StackedAreaChartProps = ComponentProps<typeof SwiftStackedArea> & BaseProps;
export type PieChartProps = ComponentProps<typeof SwiftPie> & BaseProps;
export type DonutChartProps = ComponentProps<typeof SwiftDonut> & BaseProps;
export type ScatterChartProps = ComponentProps<typeof SwiftScatter> & BaseProps;
export type BubbleChartProps = ComponentProps<typeof SwiftBubble> & BaseProps;
export type RadarChartProps = ComponentProps<typeof SwiftRadar> & BaseProps;
export type WaterfallChartProps = ComponentProps<typeof SwiftWaterfall> & BaseProps;
export type TreemapChartProps = ComponentProps<typeof SwiftTreemap> & BaseProps;
export type GaugeChartProps = ComponentProps<typeof SwiftGauge> & BaseProps;
export type RadialBarChartProps = ComponentProps<typeof SwiftRadialBar> & BaseProps;
export type FunnelChartProps = ComponentProps<typeof SwiftFunnel> & BaseProps;
export type HeatmapChartProps = ComponentProps<typeof SwiftHeatmap> & BaseProps;
export type CandlestickChartProps = ComponentProps<typeof SwiftCandlestick> & BaseProps;
export type BoxplotChartProps = ComponentProps<typeof SwiftBoxplot> & BaseProps;
export type BulletChartProps = ComponentProps<typeof SwiftBullet> & BaseProps;
export type ComboChartProps = ComponentProps<typeof SwiftCombo> & BaseProps;
export type MarimekkoChartProps = ComponentProps<typeof SwiftMarimekko> & BaseProps;
export type NetworkChartProps = ComponentProps<typeof SwiftNetwork> & BaseProps;
export type SankeyChartProps = ComponentProps<typeof SwiftSankey> & BaseProps;
export type SparklineProps = ComponentProps<typeof SwiftSparkline>;

/** Line chart. Forwards every SwiftChart `<Line>` prop (`smooth`, `dots`, `area`, …). */
export const LineChart: React.ForwardRefExoticComponent<
  LineChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftLine);
/** Area chart. Equivalent to `<LineChart area />` with a gradient fill. */
export const AreaChart: React.ForwardRefExoticComponent<
  AreaChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftArea);
/** Vertical bar chart. Pass `mapping.y` as a `string[]` for grouped bars. */
export const BarChart: React.ForwardRefExoticComponent<
  BarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftBar);
/** Horizontal bar chart. */
export const HBarChart: React.ForwardRefExoticComponent<
  HBarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftHBar);
/** Stacked bar chart. Pass `percent` for 100 %-stacked bars. */
export const StackedBarChart: React.ForwardRefExoticComponent<
  StackedBarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftStackedBar);
/** Stacked area chart. */
export const StackedAreaChart: React.ForwardRefExoticComponent<
  StackedAreaChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftStackedArea);
/** Pie chart. Use {@link DonutChart} for the ring variant. */
export const PieChart: React.ForwardRefExoticComponent<
  PieChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftPie);
/** Donut chart. Tune `donutWidth` (0–1) for ring thickness. */
export const DonutChart: React.ForwardRefExoticComponent<
  DonutChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftDonut);
/** Scatter chart. Map `groupField` for colour. */
export const ScatterChart: React.ForwardRefExoticComponent<
  ScatterChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftScatter);
/** Bubble chart — scatter with a third dimension mapped to point radius. */
export const BubbleChart: React.ForwardRefExoticComponent<
  BubbleChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftBubble);
/** Radar / spider chart for multi-axis comparison. */
export const RadarChart: React.ForwardRefExoticComponent<
  RadarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftRadar);
/** Waterfall chart for incremental positive/negative changes. */
export const WaterfallChart: React.ForwardRefExoticComponent<
  WaterfallChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftWaterfall);
/** Treemap (squarified rectangles, area ∝ value). */
export const TreemapChart: React.ForwardRefExoticComponent<
  TreemapChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftTreemap);
/** Radial gauge for a single value against a range (KPIs, scores, utilisation). */
export const GaugeChart: React.ForwardRefExoticComponent<
  GaugeChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftGauge);
/** Radial bar chart — bars wrapped around a polar axis. */
export const RadialBarChart: React.ForwardRefExoticComponent<
  RadialBarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftRadialBar);
/** Funnel chart for stage-to-stage conversion / drop-off. */
export const FunnelChart: React.ForwardRefExoticComponent<
  FunnelChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftFunnel);
/** Heatmap / matrix chart — colour-encoded 2-D grid (calendars, cohorts). */
export const HeatmapChart: React.ForwardRefExoticComponent<
  HeatmapChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftHeatmap);
/** Candlestick (OHLC) chart for financial / price-range series. */
export const CandlestickChart: React.ForwardRefExoticComponent<
  CandlestickChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftCandlestick);
/** Box-and-whisker plot for distribution / quartile summaries. */
export const BoxplotChart: React.ForwardRefExoticComponent<
  BoxplotChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftBoxplot);
/** Bullet chart — a measure against a target plus qualitative ranges (KPIs). */
export const BulletChart: React.ForwardRefExoticComponent<
  BulletChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftBullet);
/** Combo chart — overlay multiple series types (e.g. bars + a trend line). */
export const ComboChart: React.ForwardRefExoticComponent<
  ComboChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftCombo);
/** Marimekko / mosaic chart — variable-width stacked bars (share × magnitude). */
export const MarimekkoChart: React.ForwardRefExoticComponent<
  MarimekkoChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftMarimekko);
/** Network / node-link graph for relationships and topology. */
export const NetworkChart: React.ForwardRefExoticComponent<
  NetworkChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftNetwork);
/** Sankey diagram for flows between nodes (traffic, energy, budgets). */
export const SankeyChart: React.ForwardRefExoticComponent<
  SankeyChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftSankey);

/**
 * Inline sparkline. SparklineComponent has its own minimal prop surface
 * (no axes / legend / tooltip) and is intentionally forwarded as-is.
 */
export const Sparkline: React.ForwardRefExoticComponent<
  SparklineProps & React.RefAttributes<ChartRef>
> = SwiftSparkline;

/**
 * Convenience type for the SwiftChart-style `mapping` prop that tells a chart
 * which fields of `data` to render. Each chart only consumes the keys that
 * apply to its shape (`x`/`y` for cartesian, `labelField`/`valueField` for
 * pie/donut/treemap).
 */
export type ChartDataMapping = {
  /** Key in each datum to plot on the X axis (cartesian charts). */
  x?: string;
  /**
   * Key (or list of keys) in each datum to plot on the Y axis. Pass an array
   * of field names for grouped/stacked series.
   */
  y?: string | string[];
  /** Key holding each slice's label (pie/donut/treemap). */
  labelField?: string;
  /** Key holding each slice's numeric value (pie/donut/treemap/radar). */
  valueField?: string;
  /** Friendly names used in the legend in place of raw field keys. */
  seriesNames?: string[];
};

/** Convenience type for a typed row of arbitrary chart data. */
export type ChartDatum = Record<string, unknown>;

/** Render-prop ref shape kept for backwards-compatibility with consumers using imperative API. */
export type ChartHandle = ChartRef;

/** The name of either statically-registered Cynosure theme. */
export type CynosureChartTheme = typeof CYNOSURE_THEME_LIGHT | typeof CYNOSURE_THEME_DARK;

/**
 * No-op marker so existing call sites that imported a "container" component
 * still type-check. Each chart now provides its own sized container — there
 * is no longer a wrapping `ChartContainer` element.
 */
export interface ChartContainerProps {
  /** @deprecated Each chart (`<LineChart>`, `<BarChart>` …) now manages its own container. */
  children?: ReactElement;
}
