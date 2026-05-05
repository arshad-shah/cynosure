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
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { chartContainer } from './Chart.css.js';
import { CYNOSURE_THEME_DARK, CYNOSURE_THEME_LIGHT, registerCynosureThemes } from './themes.js';

/**
 * Cynosure ships two SwiftChart themes — `'cynosure-light'` and
 * `'cynosure-dark'` — registered with SwiftChart's `addTheme` API at module
 * load. Each chart wrapper picks one based on the active document color
 * scheme so the canvas matches the rest of the page without any consumer
 * configuration.
 *
 * The themes mirror the Cynosure design tokens (iris accent, surface +
 * foreground neutrals, semantic feedback colours). Need a different palette?
 * Pass `theme` directly — any value SwiftChart accepts (built-in name,
 * registered name, or full `Theme` object) is forwarded untouched.
 */
registerCynosureThemes();

/** Re-export the theme registration helpers for app-level `addTheme` extensions. */
export {
  CYNOSURE_THEME_DARK,
  CYNOSURE_THEME_LIGHT,
  cynosureChartThemes,
  registerCynosureThemes,
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

/**
 * Subscribe to color-scheme changes from any of the sources `readScheme`
 * checks. The component re-renders when the scheme flips, which prompts
 * SwiftChart to repaint with the new theme.
 */
function useColorScheme(): SchemeName {
  const [scheme, setScheme] = useState<SchemeName>(() => readScheme());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setScheme(readScheme());

    // 1. `data-theme` flips on <html>.
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

  return scheme;
}

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
 * Wraps a SwiftChart React component in a sized container. Defaults `theme`
 * to one of SwiftChart's built-ins based on the active color scheme; consumer
 * `theme` always wins.
 */
function createChart<P extends { theme?: unknown }>(
  Component: React.ForwardRefExoticComponent<P & React.RefAttributes<ChartRef>>,
) {
  return forwardRef<ChartRef, P & BaseProps>(function ThemedChart(props, ref) {
    const { className, style, aspectRatio, height, minHeight, theme, ...rest } = props as P &
      BaseProps;

    const scheme = useColorScheme();
    const wrapperStyle = useWrapperStyle({ aspectRatio, height, minHeight, style });

    const resolvedTheme: unknown =
      theme ?? (scheme === 'dark' ? CYNOSURE_THEME_DARK : CYNOSURE_THEME_LIGHT);

    // Re-key on theme so SwiftChart fully repaints when the scheme flips
    // (re-using the same canvas would draw the old colors over the new).
    const key = typeof resolvedTheme === 'string' ? resolvedTheme : 'custom';

    const merged = {
      ...rest,
      theme: resolvedTheme,
      width: '100%',
      height: '100%',
    } as unknown as P & React.RefAttributes<ChartRef>;

    return (
      <div className={cn(chartContainer, className)} style={wrapperStyle}>
        <Component key={key} ref={ref as Ref<ChartRef>} {...merged} />
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
/** Scatter / bubble chart. Map `groupField` for colour, `sizeField` for radius. */
export const ScatterChart: React.ForwardRefExoticComponent<
  ScatterChartProps & React.RefAttributes<ChartRef>
> = createChart(SwiftScatter);
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

/**
 * Inline sparkline. SparklineComponent has its own minimal prop surface
 * (no axes / legend / tooltip) and is intentionally forwarded as-is.
 */
export const Sparkline: React.ForwardRefExoticComponent<
  SparklineProps & React.RefAttributes<ChartRef>
> = SwiftSparkline;

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

/** The name of either Cynosure theme registered with SwiftChart. */
export type CynosureChartTheme = typeof CYNOSURE_THEME_LIGHT | typeof CYNOSURE_THEME_DARK;

/** No-op marker so existing call sites that imported a "container" component still type-check. */
export interface ChartContainerProps {
  /** @deprecated Each chart (`<LineChart>`, `<BarChart>` …) now manages its own container. */
  children?: ReactElement;
}
