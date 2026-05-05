import {
  type ChartRef,
  Area as SwiftArea,
  Bar as SwiftBar,
  Donut as SwiftDonut,
  HBar as SwiftHBar,
  Line as SwiftLine,
  Pie as SwiftPie,
  Radar as SwiftRadar,
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
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { chartContainer } from './Chart.css.js';

/**
 * Cynosure-themed wrappers around `@arshad-shah/swift-chart`. SwiftChart is a
 * tiny (≈20 KB), zero-dependency Canvas 2D renderer with first-class React
 * bindings — we ship thin wrappers that:
 *
 *   - read CSS custom properties for series colours so charts respond to
 *     theme switches without re-renders
 *   - default to a transparent, surface-aware backdrop (canvas inherits the
 *     surrounding card / page background rather than painting its own)
 *   - keep the underlying SwiftChart prop surface intact — every option is
 *     forwarded, so consumers can reach for `area`, `smooth`, `donutWidth`,
 *     etc. as documented upstream.
 */

/** Re-export the SwiftChart imperative ref so consumers can call `.resize()` / `.toDataURL()`. */
export type { ChartRef } from '@arshad-shah/swift-chart/react';

const FALLBACK_PALETTE = [
  'var(--cynosure-color-accent-solid, #5b8cff)',
  'var(--cynosure-color-feedback-info-solid, #38bdf8)',
  'var(--cynosure-color-feedback-success-solid, #22c55e)',
  'var(--cynosure-color-feedback-warning-solid, #f59e0b)',
  'var(--cynosure-color-feedback-danger-solid, #ef4444)',
  'var(--cynosure-color-foreground-muted, #94a3b8)',
];

/**
 * The SwiftChart {@link Theme} shape we hand to the canvas. We expose this
 * as a Cynosure-token-aware default so charts pick up the active theme.
 */
const cynosureTheme = {
  bg: 'transparent',
  surface: 'transparent',
  grid: 'var(--cynosure-color-border-subtle, rgba(148, 163, 184, 0.2))',
  text: 'var(--cynosure-color-foreground-default, #0f172a)',
  textMuted: 'var(--cynosure-color-foreground-muted, #64748b)',
  axis: 'var(--cynosure-color-border-default, #cbd5e1)',
  positive: 'var(--cynosure-color-feedback-success-solid, #22c55e)',
  negative: 'var(--cynosure-color-feedback-danger-solid, #ef4444)',
  onAccent: 'var(--cynosure-color-background-default, #ffffff)',
  colors: FALLBACK_PALETTE,
};

interface BaseProps {
  className?: string;
  style?: CSSProperties;
  /** Aspect ratio for the wrapper. Accepts `"16 / 9"`, `1.78`, etc. Default `"16 / 9"`. */
  aspectRatio?: string | number;
  /** Fixed pixel/CSS height. When set, takes precedence over `aspectRatio`. */
  height?: number | string;
  /** Minimum height — useful inside flex containers. Default `220`. */
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
 * Generic factory that wraps any SwiftChart React component in a Cynosure
 * container. Keeps the chart itself untouched (so all SwiftChart props pass
 * through) but applies our themed palette + a sized wrapper.
 */
function createChart<P extends object>(
  Component: React.ForwardRefExoticComponent<P & React.RefAttributes<ChartRef>>,
  defaults: Partial<P> = {},
) {
  return forwardRef<ChartRef, P & BaseProps>(function ThemedChart(props, ref) {
    const {
      className,
      style,
      aspectRatio,
      height,
      minHeight,
      // Component-specific props pulled through:
      ...rest
    } = props as P & BaseProps & { theme?: unknown };

    const wrapperStyle = useWrapperStyle({ aspectRatio, height, minHeight, style });

    // Allow consumers to override the theme; otherwise apply the Cynosure
    // tokens. We never set `width`/`height` on the inner component when the
    // wrapper drives the size (height="100%" lets SwiftChart fill us).
    const merged = {
      theme: cynosureTheme,
      ...defaults,
      ...rest,
      width: '100%',
      height: '100%',
    } as P & React.RefAttributes<ChartRef>;

    return (
      <div className={cn(chartContainer, className)} style={wrapperStyle}>
        <Component ref={ref as Ref<ChartRef>} {...merged} />
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
export type RadarChartProps = ComponentProps<typeof SwiftRadar> & BaseProps;
export type WaterfallChartProps = ComponentProps<typeof SwiftWaterfall> & BaseProps;
export type TreemapChartProps = ComponentProps<typeof SwiftTreemap> & BaseProps;
export type SparklineProps = ComponentProps<typeof SwiftSparkline>;

/** Themed line chart. Forwards all SwiftChart `<Line>` props (`smooth`, `dots`, `area`, …). */
export const LineChart: React.ForwardRefExoticComponent<
  LineChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftLine);
/** Themed area chart. Equivalent to `<LineChart area />` with a gradient fill. */
export const AreaChart: React.ForwardRefExoticComponent<
  AreaChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftArea);
/** Themed vertical bar chart. Pass `mapping.y` as a `string[]` for grouped bars. */
export const BarChart: React.ForwardRefExoticComponent<
  BarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftBar);
/** Themed horizontal bar chart. */
export const HBarChart: React.ForwardRefExoticComponent<
  HBarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftHBar);
/** Themed stacked bar chart. Pass `percent` for 100 %-stacked bars. */
export const StackedBarChart: React.ForwardRefExoticComponent<
  StackedBarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftStackedBar);
/** Themed stacked area chart. */
export const StackedAreaChart: React.ForwardRefExoticComponent<
  StackedAreaChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftStackedArea);
/** Themed pie chart. Use {@link DonutChart} for the ring variant. */
export const PieChart: React.ForwardRefExoticComponent<
  PieChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftPie);
/** Themed donut chart. Tune `donutWidth` (0–1) for ring thickness. */
export const DonutChart: React.ForwardRefExoticComponent<
  DonutChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftDonut);
/** Themed scatter / bubble chart. Map `groupField` for colour, `sizeField` for radius. */
export const ScatterChart: React.ForwardRefExoticComponent<
  ScatterChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftScatter);
/** Themed radar / spider chart for multi-axis comparison. */
export const RadarChart: React.ForwardRefExoticComponent<
  RadarChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftRadar);
/** Themed waterfall chart for incremental positive/negative changes. */
export const WaterfallChart: React.ForwardRefExoticComponent<
  WaterfallChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftWaterfall);
/** Themed treemap (squarified rectangles, area ∝ value). */
export const TreemapChart: React.ForwardRefExoticComponent<
  TreemapChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftTreemap);

/**
 * Inline sparkline. SparklineComponent has its own minimal prop surface
 * (no axes / legend / tooltip) and is intentionally forwarded as-is.
 */
export const Sparkline: React.ForwardRefExoticComponent<
  SparklineProps & React.RefAttributes<ChartRef>
> = SwiftSparkline;

/**
 * Re-export the upstream theme object so consumers building custom themes can
 * spread it and override individual colours.
 */
export const defaultChartTheme = cynosureTheme;

/** Convenience type for the SwiftChart-style data mapping object. */
export type ChartDataMapping = {
  x?: string;
  y?: string | string[];
  labelField?: string;
  valueField?: string;
  seriesNames?: string[];
};

/** Convenience type for a typed row of arbitrary chart data. */
export type ChartDatum = Record<string, unknown>;

/** Render-prop ref shape kept for backwards-compatibility with consumers using imperative API. */
export type ChartHandle = ChartRef;

/** No-op marker so existing call sites that imported a "container" component still type-check. */
export interface ChartContainerProps {
  /** @deprecated Each themed chart (`<LineChart>`, `<BarChart>` …) now manages its own container. */
  children?: ReactElement;
}
