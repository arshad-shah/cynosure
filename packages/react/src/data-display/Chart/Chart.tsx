import {
  type CSSProperties,
  type ComponentProps,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
} from 'react';
import {
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../../utils/cn.js';
import {
  chartContainer,
  chartLegend,
  chartLegendItem,
  chartLegendSwatch,
  chartTooltip,
  chartTooltipLabel,
  chartTooltipName,
  chartTooltipRow,
  chartTooltipRows,
  chartTooltipSwatch,
  chartTooltipValue,
} from './Chart.css.js';

/**
 * Configure the visual identity of each series in a chart once, at the
 * container level. Keys match the `dataKey` / series name Recharts emits.
 *
 *   const config = {
 *     revenue: { label: 'Revenue', color: 'var(--cynosure-color-accent-solid)' },
 *     cost:    { label: 'Cost',    color: 'var(--cynosure-color-feedback-danger-solid)' },
 *   };
 */
export interface ChartSeriesConfig {
  /** Display name shown in tooltip + legend. Falls back to the data key. */
  label?: ReactNode;
  /** CSS color (hex / var / rgb). Used by tooltip dot, legend swatch, and default stroke/fill. */
  color?: string;
  /** Optional icon slot rendered next to the label in the legend. */
  icon?: ReactNode;
}

export type ChartConfig = Record<string, ChartSeriesConfig>;

interface ChartContextValue {
  config: ChartConfig;
  id: string;
}

const ChartContext = createContext<ChartContextValue | null>(null);

function useChartContext(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error('Chart primitives must be rendered inside <ChartContainer>.');
  }
  return ctx;
}

export interface ChartContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Series config keyed by dataKey. Drives tooltip/legend labels + colors. */
  config: ChartConfig;
  /**
   * Aspect ratio for the responsive container. Accepts `"16 / 9"`, `"1 / 1"`,
   * or a number like `1.78`. Default `"16 / 9"`.
   */
  aspectRatio?: string | number;
  /** Fixed height instead of aspect ratio. Takes precedence when set. */
  height?: number | string;
  /** Minimum height — useful inside flex containers. Default `220`. */
  minHeight?: number | string;
  /**
   * The Recharts chart (`<LineChart>`, `<BarChart>`, etc.). Must be a single
   * element so `ResponsiveContainer` can clone it with measured dimensions.
   */
  children: ReactElement;
}

/**
 * Themed wrapper for a Recharts chart. Provides series config via context,
 * applies CSS variables for stroke/fill defaults, and renders the chart
 * inside a `ResponsiveContainer` so it fills its parent.
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  function ChartContainer(
    {
      config,
      aspectRatio = '16 / 9',
      height,
      minHeight = 220,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const id = useId();
    const contextValue = useMemo(() => ({ config, id }), [config, id]);

    const colorVars = useMemo<CSSProperties>(() => {
      const vars: Record<string, string> = {};
      for (const [key, series] of Object.entries(config)) {
        if (series.color) {
          vars[`--cynosure-chart-series-${key}`] = series.color;
        }
      }
      return vars as CSSProperties;
    }, [config]);

    const sizingStyle: CSSProperties =
      height !== undefined
        ? { height, minHeight }
        : {
            aspectRatio: typeof aspectRatio === 'number' ? String(aspectRatio) : aspectRatio,
            minHeight,
          };

    return (
      <ChartContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-chart={id}
          className={cn(chartContainer, className)}
          style={{ ...sizingStyle, ...colorVars, ...style }}
          {...rest}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  },
);

/**
 * Helper: pull the resolved color for a series. Falls back to a neutral if
 * nothing is configured.
 */
export function useChartSeriesColor(key: string, fallback = 'currentColor'): string {
  const { config } = useChartContext();
  return config[key]?.color ?? fallback;
}

/**
 * Helper: build the `stroke` / `fill` props for a Recharts series element
 * from the container config. Lets you write
 * `<Line dataKey="revenue" {...chartSeriesProps('revenue')} />`.
 */
export function chartSeriesProps(
  config: ChartConfig,
  key: string,
): {
  stroke: string;
  fill: string;
  name?: string;
} {
  const series = config[key];
  const color = series?.color ?? 'var(--cynosure-color-foreground-muted)';
  return {
    stroke: color,
    fill: color,
    name: typeof series?.label === 'string' ? series.label : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

type TooltipPayload = {
  name?: string;
  value?: number | string | Array<number | string>;
  dataKey?: string | number;
  color?: string;
  payload?: unknown;
};

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: ReactNode;
  /** Format the series value. Default `Intl.NumberFormat`. */
  formatter?: (value: number | string, name: string) => ReactNode;
  /** Format the header label. Default identity. */
  labelFormatter?: (label: ReactNode) => ReactNode;
  /** Hide the header label row. */
  hideLabel?: boolean;
  /** Hide the coloured swatch. */
  hideIndicator?: boolean;
  className?: string;
}

const defaultFormatter = (value: number | string): ReactNode => {
  if (typeof value === 'number') return new Intl.NumberFormat().format(value);
  return value;
};

/**
 * Content slot for Recharts' `<Tooltip>`. Wire it up as:
 *
 *   <Tooltip content={<ChartTooltipContent />} />
 *
 * or use the pre-wired `<ChartTooltip />` below.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter = defaultFormatter,
  labelFormatter = (l) => l,
  hideLabel,
  hideIndicator,
  className,
}: ChartTooltipContentProps): ReactElement | null {
  const { config } = useChartContext();

  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className={cn(chartTooltip, className)}>
      {!hideLabel && label != null ? (
        <div className={chartTooltipLabel}>{labelFormatter(label)}</div>
      ) : null}
      <div className={chartTooltipRows}>
        {payload.map((entry) => {
          const key = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey);
          const series = config[key];
          const name = series?.label ?? entry.name ?? key;
          const color = series?.color ?? entry.color ?? 'currentColor';
          const value = Array.isArray(entry.value) ? entry.value.join(' – ') : (entry.value ?? '');
          return (
            <div className={chartTooltipRow} key={key}>
              <span className={chartTooltipName}>
                {!hideIndicator ? (
                  <span className={chartTooltipSwatch} style={{ background: color }} aria-hidden />
                ) : null}
                {name}
              </span>
              <span className={chartTooltipValue}>
                {formatter(value as number | string, String(name))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type ChartTooltipProps = Omit<ComponentProps<typeof RechartsTooltip>, 'content'> & {
  /** Override the rendered content. Defaults to `<ChartTooltipContent />`. */
  content?: ComponentProps<typeof RechartsTooltip>['content'];
};

/** Pre-wired tooltip — drop inside any chart and it picks up the config via context. */
export function ChartTooltip({
  content = <ChartTooltipContent />,
  cursor = true,
  ...rest
}: ChartTooltipProps): ReactElement {
  return <RechartsTooltip content={content} cursor={cursor} {...rest} />;
}

/* ------------------------------------------------------------------ */
/*  Legend                                                             */
/* ------------------------------------------------------------------ */

type LegendPayload = {
  value?: string;
  dataKey?: string | number;
  color?: string;
  inactive?: boolean;
  payload?: unknown;
};

export interface ChartLegendContentProps {
  payload?: LegendPayload[];
  /** Called with the series key when an item is clicked. */
  onItemClick?: (key: string) => void;
  /** Map of key → hidden state for interactive toggles. */
  hidden?: Record<string, boolean>;
  className?: string;
}

/** Content slot for Recharts' `<Legend>`. Themed swatches + configurable labels. */
export function ChartLegendContent({
  payload,
  onItemClick,
  hidden,
  className,
}: ChartLegendContentProps): ReactElement | null {
  const { config } = useChartContext();
  if (!payload || payload.length === 0) return null;
  return (
    <div className={cn(chartLegend, className)}>
      {payload.map((entry, i) => {
        const key =
          typeof entry.dataKey === 'string'
            ? entry.dataKey
            : typeof entry.value === 'string'
              ? entry.value
              : `legend-${i}`;
        const series = config[key];
        const label = series?.label ?? entry.value ?? key;
        const color = series?.color ?? entry.color ?? 'currentColor';
        const isHidden = hidden?.[key] ?? entry.inactive ?? false;
        const interactive = Boolean(onItemClick);
        return (
          <button
            key={key}
            type="button"
            disabled={!interactive}
            data-interactive={interactive || undefined}
            data-hidden={isHidden || undefined}
            className={chartLegendItem}
            onClick={interactive ? () => onItemClick?.(key) : undefined}
            style={{ background: 'transparent', border: 'none', padding: 0 }}
          >
            {series?.icon ?? (
              <span className={chartLegendSwatch} style={{ background: color }} aria-hidden />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export type ChartLegendProps = Omit<ComponentProps<typeof RechartsLegend>, 'content'> & {
  content?: ComponentProps<typeof RechartsLegend>['content'];
};

/** Pre-wired legend. Horizontal, bottom-aligned, picks labels/colors from context. */
export function ChartLegend({
  content = <ChartLegendContent />,
  verticalAlign = 'bottom',
  ...rest
}: ChartLegendProps): ReactElement {
  return <RechartsLegend content={content} verticalAlign={verticalAlign} {...rest} />;
}

export { useChartContext };
