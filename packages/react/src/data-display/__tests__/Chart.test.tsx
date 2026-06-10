import { render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';

// SwiftChart paints to <canvas> via a ResizeObserver; jsdom has neither layout
// nor canvas. Stub the React entrypoint with simple placeholders so we can
// assert the wrapper's sizing/className/theme-routing behaviour without
// bringing in the real renderer.
vi.mock('@arshad-shah/swift-chart', () => ({
  addTheme: vi.fn(),
}));
vi.mock('@arshad-shah/swift-chart/react', () => {
  const stub = (label: string) =>
    Object.assign(
      ({
        className,
        style,
        theme,
      }: {
        className?: string;
        style?: React.CSSProperties;
        theme?: unknown;
      }) => {
        const colors =
          theme &&
          typeof theme === 'object' &&
          Array.isArray((theme as { colors?: unknown }).colors)
            ? (theme as { colors: string[] }).colors.join(',')
            : '';
        return (
          <div
            data-swift={label}
            data-theme={typeof theme === 'string' ? theme : 'object'}
            data-colors={colors}
            className={className}
            style={style}
          />
        );
      },
      { displayName: `Swift${label}` },
    );
  return {
    Line: stub('Line'),
    Area: stub('Area'),
    Bar: stub('Bar'),
    HBar: stub('HBar'),
    StackedBar: stub('StackedBar'),
    StackedArea: stub('StackedArea'),
    Pie: stub('Pie'),
    Donut: stub('Donut'),
    Scatter: stub('Scatter'),
    Bubble: stub('Bubble'),
    Radar: stub('Radar'),
    Waterfall: stub('Waterfall'),
    Treemap: stub('Treemap'),
    Gauge: stub('Gauge'),
    RadialBar: stub('RadialBar'),
    Funnel: stub('Funnel'),
    Heatmap: stub('Heatmap'),
    Candlestick: stub('Candlestick'),
    Boxplot: stub('Boxplot'),
    Bullet: stub('Bullet'),
    Combo: stub('Combo'),
    Marimekko: stub('Marimekko'),
    Network: stub('Network'),
    Sankey: stub('Sankey'),
    SparklineComponent: stub('Sparkline'),
  };
});

const { LineChart, BarChart, DonutChart, PieChart, GaugeChart } = await import('../Chart/index.js');

const data = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1600 },
];

describe('Chart wrappers', () => {
  it('renders a LineChart with sensible default sizing', () => {
    const { container } = render(<LineChart data={data} mapping={{ x: 'month', y: 'revenue' }} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.aspectRatio).toBe('16 / 9');
    expect(wrapper.style.minHeight).toBe('220px');
    expect(wrapper.querySelector('[data-swift="Line"]')).not.toBeNull();
  });

  it('forwards a fixed height when provided', () => {
    const { container } = render(
      <BarChart data={data} mapping={{ x: 'month', y: 'revenue' }} height={320} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.height).toBe('320px');
    expect(wrapper.style.aspectRatio).toBe('');
  });

  it('accepts a numeric aspectRatio', () => {
    const { container } = render(
      <PieChart
        data={data}
        mapping={{ labelField: 'month', valueField: 'revenue' }}
        aspectRatio={2}
      />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe('2');
  });

  it('merges consumer className with the themed wrapper class', () => {
    const { container } = render(
      <DonutChart
        data={data}
        mapping={{ labelField: 'month', valueField: 'revenue' }}
        className="custom-card"
      />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('custom-card');
  });

  it('exposes the newly-wrapped chart types', () => {
    const { container } = render(<GaugeChart data={data} mapping={{ x: 'month', y: 'revenue' }} />);
    expect(container.querySelector('[data-swift="Gauge"]')).not.toBeNull();
  });

  it('resolves a concrete theme object from the light palette by default', () => {
    document.documentElement.dataset.theme = 'light';
    const { container } = render(<LineChart data={data} mapping={{ x: 'month', y: 'revenue' }} />);
    const inner = container.querySelector('[data-swift="Line"]') as HTMLElement;
    expect(inner.dataset.theme).toBe('object');
    // Falls back to the static light series palette (iris-600 leads).
    expect(inner.dataset.colors?.split(',')[0]).toBe('#5663e6');
  });

  it('resolves the dark palette in dark mode', () => {
    document.documentElement.dataset.theme = 'dark';
    const { container } = render(<LineChart data={data} mapping={{ x: 'month', y: 'revenue' }} />);
    const inner = container.querySelector('[data-swift="Line"]') as HTMLElement;
    expect(inner.dataset.colors?.split(',')[0]).toBe('#8b9dff');
    delete document.documentElement.dataset.theme;
  });

  it('lets a consumer override a single series colour via --cynosure-chart-* ', () => {
    const { container } = render(
      <LineChart
        data={data}
        mapping={{ x: 'month', y: 'revenue' }}
        style={{ '--cynosure-chart-1': '#abcdef' } as CSSProperties}
      />,
    );
    const inner = container.querySelector('[data-swift="Line"]') as HTMLElement;
    expect(inner.dataset.colors?.split(',')[0]).toBe('#abcdef');
  });

  it('honours an explicit theme prop over the auto-resolved default', () => {
    const { container } = render(
      <LineChart data={data} mapping={{ x: 'month', y: 'revenue' }} theme="midnight" />,
    );
    const inner = container.querySelector('[data-swift="Line"]') as HTMLElement;
    expect(inner.dataset.theme).toBe('midnight');
  });
});
