import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Recharts' ResponsiveContainer measures its parent to decide a size — jsdom
// has no layout engine so it renders nothing. Stub it with a pass-through that
// still lets our chart primitives render their markup + context.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 600, height: 300 }}>{children}</div>
    ),
  };
});

// Import after mock so ChartContainer picks up the stubbed ResponsiveContainer.
const { ChartContainer, ChartLegendContent, ChartTooltipContent, chartSeriesProps } = await import(
  '../Chart/index.js'
);
type ChartConfig = import('../Chart/index.js').ChartConfig;

const config: ChartConfig = {
  revenue: { label: 'Revenue', color: '#ff0000' },
  cost: { label: 'Cost', color: '#00ff00' },
};

function Wrap({ children, height = 100 }: { children: ReactNode; height?: number }) {
  // Container must be given a single ReactElement child; the tooltip/legend
  // content is rendered standalone alongside it inside a fragment-capable div
  // so we don't depend on Recharts measuring anything.
  return (
    <ChartContainer config={config} height={height}>
      <div data-testid="chart-fake">{children}</div>
    </ChartContainer>
  );
}

describe('ChartContainer', () => {
  it('renders the container and wrapped child', () => {
    const { container } = render(
      <Wrap>
        <span>chart body</span>
      </Wrap>,
    );
    expect(container.querySelector('[data-chart]')).not.toBeNull();
    expect(screen.getByTestId('chart-fake')).toBeInTheDocument();
  });

  it('respects the aspectRatio prop', () => {
    const { container } = render(
      <ChartContainer config={config} aspectRatio="4 / 3">
        <div />
      </ChartContainer>,
    );
    const root = container.querySelector('[data-chart]') as HTMLElement;
    expect(root.style.aspectRatio).toBe('4 / 3');
  });

  it('accepts a numeric aspectRatio', () => {
    const { container } = render(
      <ChartContainer config={config} aspectRatio={2}>
        <div />
      </ChartContainer>,
    );
    const root = container.querySelector('[data-chart]') as HTMLElement;
    expect(root.style.aspectRatio).toBe('2');
  });

  it('writes a CSS variable per configured series color', () => {
    const { container } = render(
      <ChartContainer config={config} height={100}>
        <div />
      </ChartContainer>,
    );
    const root = container.querySelector('[data-chart]') as HTMLElement;
    expect(root.style.getPropertyValue('--cynosure-chart-series-revenue')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--cynosure-chart-series-cost')).toBe('#00ff00');
  });
});

describe('chartSeriesProps', () => {
  it('returns color + name from config', () => {
    const p = chartSeriesProps(config, 'revenue');
    expect(p.stroke).toBe('#ff0000');
    expect(p.fill).toBe('#ff0000');
    expect(p.name).toBe('Revenue');
  });

  it('falls back to a neutral when series is missing', () => {
    const p = chartSeriesProps(config, 'unknown');
    expect(p.stroke).toContain('var(');
    expect(p.name).toBeUndefined();
  });
});

describe('ChartTooltipContent', () => {
  it('throws when rendered outside a ChartContainer', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(<ChartTooltipContent active payload={[{ dataKey: 'x', value: 1 }]} />),
    ).toThrow(/Chart primitives must be rendered inside/);
    spy.mockRestore();
  });

  it('formats numeric values by default', () => {
    render(
      <Wrap>
        <ChartTooltipContent
          active
          label="March"
          payload={[
            { dataKey: 'revenue', value: 1234, color: '#f00' },
            { dataKey: 'cost', value: 500, color: '#0f0' },
          ]}
        />
      </Wrap>,
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('March')).toBeInTheDocument();
  });

  it('hides the label row when hideLabel is set', () => {
    render(
      <Wrap>
        <ChartTooltipContent
          active
          hideLabel
          label="Q1"
          payload={[{ dataKey: 'revenue', value: 1 }]}
        />
      </Wrap>,
    );
    expect(screen.queryByText('Q1')).not.toBeInTheDocument();
  });

  it('hides the indicator swatch when hideIndicator is set', () => {
    const { container } = render(
      <Wrap>
        <ChartTooltipContent active hideIndicator payload={[{ dataKey: 'revenue', value: 5 }]} />
      </Wrap>,
    );
    // No swatch element should be rendered.
    expect(container.querySelectorAll('[class*="chartTooltipSwatch"]').length).toBe(0);
  });

  it('renders nothing when payload is empty', () => {
    const { container } = render(
      <Wrap>
        <ChartTooltipContent active payload={[]} />
      </Wrap>,
    );
    expect(container.querySelector('[class*="chartTooltip_"]')).toBeNull();
  });

  it('renders nothing when inactive', () => {
    const { container } = render(
      <Wrap>
        <ChartTooltipContent payload={[{ dataKey: 'revenue', value: 1 }]} />
      </Wrap>,
    );
    expect(container.querySelector('[class*="chartTooltip_"]')).toBeNull();
  });

  it('joins array values with an en dash', () => {
    render(
      <Wrap>
        <ChartTooltipContent active payload={[{ dataKey: 'revenue', value: [10, 20] }]} />
      </Wrap>,
    );
    expect(screen.getByText('10 – 20')).toBeInTheDocument();
  });
});

describe('ChartLegendContent', () => {
  it('renders each payload entry with the configured label', () => {
    render(
      <Wrap>
        <ChartLegendContent
          payload={[
            { dataKey: 'revenue', color: '#f00' },
            { dataKey: 'cost', color: '#0f0' },
          ]}
        />
      </Wrap>,
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
  });

  it('renders nothing when payload is empty', () => {
    const { container } = render(
      <Wrap>
        <ChartLegendContent payload={[]} />
      </Wrap>,
    );
    expect(container.querySelector('[class*="chartLegend_"]')).toBeNull();
  });

  it('fires onItemClick when a legend row is clicked', () => {
    const onItemClick = vi.fn();
    render(
      <Wrap>
        <ChartLegendContent
          onItemClick={onItemClick}
          payload={[{ dataKey: 'revenue', color: '#f00' }]}
        />
      </Wrap>,
    );
    screen.getByText('Revenue').closest('button')?.click();
    expect(onItemClick).toHaveBeenCalledWith('revenue');
  });
});
