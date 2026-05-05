import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// SwiftChart paints to <canvas> via a ResizeObserver; jsdom has neither layout
// nor canvas. Stub the React entrypoint with simple placeholders so we can
// assert the wrapper's sizing/className behaviour without bringing in the real
// renderer.
vi.mock('@arshad-shah/swift-chart/react', () => {
  const stub = (label: string) =>
    Object.assign(
      ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
        <div data-swift={label} className={className} style={style} />
      ),
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
    Radar: stub('Radar'),
    Waterfall: stub('Waterfall'),
    Treemap: stub('Treemap'),
    SparklineComponent: stub('Sparkline'),
  };
});

const { LineChart, BarChart, DonutChart, PieChart, defaultChartTheme } = await import(
  '../Chart/index.js'
);

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
    // Underlying SwiftChart Line stub mounted inside the wrapper.
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

  it('exposes the Cynosure theme palette', () => {
    expect(defaultChartTheme.colors.length).toBeGreaterThanOrEqual(4);
    expect(defaultChartTheme.bg).toBe('transparent');
  });
});
