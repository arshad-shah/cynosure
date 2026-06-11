import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import {
  AreaChart,
  BarChart,
  BoxplotChart,
  BubbleChart,
  BulletChart,
  CandlestickChart,
  ComboChart,
  DonutChart,
  FunnelChart,
  GaugeChart,
  HBarChart,
  HeatmapChart,
  LineChart,
  MarimekkoChart,
  NetworkChart,
  PieChart,
  RadarChart,
  RadialBarChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
} from './Chart.js';

const meta: Meta = {
  title: 'Data display/Chart',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Cynosure ships its charts as themed wrappers around `@arshad-shah/swift-chart` — a tiny, zero-dependency Canvas 2D library with first-class React bindings. Each chart accepts the full SwiftChart prop surface; only the `theme` defaults to Cynosure tokens. See the [SwiftChart docs](https://swiftchart.arshadshah.com) for the underlying API.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const revenueData = [
  { month: 'Jan', revenue: 1200, cost: 800 },
  { month: 'Feb', revenue: 1600, cost: 900 },
  { month: 'Mar', revenue: 2100, cost: 1100 },
  { month: 'Apr', revenue: 1900, cost: 1000 },
  { month: 'May', revenue: 2500, cost: 1300 },
  { month: 'Jun', revenue: 3000, cost: 1500 },
];

export const Line_: Story = {
  name: 'Line',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue vs. cost
      </Heading>
      <LineChart
        data={revenueData}
        mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
        smooth
        dots
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Area_: Story = {
  name: 'Area',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue
      </Heading>
      <AreaChart
        data={revenueData}
        mapping={{ x: 'month', y: 'revenue', seriesNames: ['Revenue'] }}
        smooth
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Bar_: Story = {
  name: 'Bar',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Monthly revenue
      </Heading>
      <BarChart
        data={revenueData}
        mapping={{ x: 'month', y: 'revenue', seriesNames: ['Revenue'] }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const StackedBar_: Story = {
  name: 'Stacked Bar',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue + cost (stacked)
      </Heading>
      <StackedBarChart
        data={revenueData}
        mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const StackedArea_: Story = {
  name: 'Stacked Area',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Stacked traffic by source
      </Heading>
      <StackedAreaChart
        data={revenueData}
        mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
        smooth
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

const trafficData = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 6800 },
  { source: 'Referral', visits: 1900 },
  { source: 'Social', visits: 2400 },
];

export const HBar_: Story = {
  name: 'Horizontal Bar',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Traffic by source
      </Heading>
      <HBarChart data={trafficData} mapping={{ x: 'source', y: 'visits' }} aspectRatio="4 / 3" />
    </Stack>
  ),
};

export const Pie_: Story = {
  name: 'Pie',
  render: () => (
    <Stack gap="2" style={{ width: '24rem' }}>
      <Heading as="h3" size="sm">
        Region split
      </Heading>
      <PieChart
        data={trafficData}
        mapping={{ labelField: 'source', valueField: 'visits' }}
        aspectRatio="1 / 1"
      />
    </Stack>
  ),
};

export const Donut_: Story = {
  name: 'Donut',
  render: () => (
    <Stack gap="2" style={{ width: '24rem' }}>
      <Heading as="h3" size="sm">
        Traffic share
      </Heading>
      <DonutChart
        data={trafficData}
        mapping={{ labelField: 'source', valueField: 'visits' }}
        donutWidth={0.55}
        aspectRatio="1 / 1"
      />
    </Stack>
  ),
};

const scatterData = Array.from({ length: 24 }, (_, i) => ({
  x: i,
  y: Math.round(Math.sin(i / 3) * 50 + 100 + Math.random() * 20),
  group: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
}));

export const Scatter_: Story = {
  name: 'Scatter',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Latency samples
      </Heading>
      <ScatterChart
        data={scatterData}
        mapping={{ x: 'x', y: 'y', groupField: 'group' }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

const radarData = [
  { axis: 'Speed', teamA: 80, teamB: 60 },
  { axis: 'Power', teamA: 70, teamB: 90 },
  { axis: 'Range', teamA: 90, teamB: 50 },
  { axis: 'Stealth', teamA: 50, teamB: 80 },
  { axis: 'Cost', teamA: 60, teamB: 70 },
];

export const Radar_: Story = {
  name: 'Radar',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Capability comparison
      </Heading>
      <RadarChart
        data={radarData}
        mapping={{ x: 'axis', y: ['teamA', 'teamB'], seriesNames: ['Team A', 'Team B'] }}
        aspectRatio="1 / 1"
      />
    </Stack>
  ),
};

const waterfallData = [
  { label: 'Start', value: 1000 },
  { label: 'Q1', value: 250 },
  { label: 'Q2', value: -120 },
  { label: 'Q3', value: 380 },
  { label: 'Q4', value: -90 },
];

export const Waterfall_: Story = {
  name: 'Waterfall',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Quarterly deltas
      </Heading>
      <WaterfallChart
        data={waterfallData}
        mapping={{ x: 'label', y: 'value' }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Sparkline_: Story = {
  name: 'Sparkline',
  render: () => (
    <Stack gap="2" style={{ width: '14rem' }}>
      <Heading as="h3" size="sm">
        Mini trend
      </Heading>
      <Sparkline data={[12, 14, 13, 18, 22, 24, 21, 26, 30, 32, 28, 35]} height={48} filled />
    </Stack>
  ),
};

export const Combo_: Story = {
  name: 'Combo (bar + line)',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue with cost trend
      </Heading>
      <ComboChart
        data={revenueData}
        mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
        lineSeries={['Cost']}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Gauge_: Story = {
  name: 'Gauge',
  render: () => (
    <Stack gap="2" style={{ width: '24rem' }}>
      <Heading as="h3" size="sm">
        SLA attainment
      </Heading>
      <GaugeChart value={86} min={0} max={100} aspectRatio="2 / 1" />
    </Stack>
  ),
};

export const RadialBar_: Story = {
  name: 'Radial bar',
  render: () => (
    <Stack gap="2" style={{ width: '24rem' }}>
      <Heading as="h3" size="sm">
        Traffic by source
      </Heading>
      <RadialBarChart
        data={trafficData}
        mapping={{ x: 'source', y: 'visits' }}
        innerRadius={0.35}
        aspectRatio="1 / 1"
      />
    </Stack>
  ),
};

const funnelData = [
  { stage: 'Visited', value: 12000 },
  { stage: 'Signed up', value: 5200 },
  { stage: 'Activated', value: 3100 },
  { stage: 'Subscribed', value: 1450 },
];

export const Funnel_: Story = {
  name: 'Funnel',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Activation funnel
      </Heading>
      <FunnelChart data={funnelData} mapping={{ x: 'stage', y: 'value' }} aspectRatio="4 / 3" />
    </Stack>
  ),
};

const bubbleData = Array.from({ length: 18 }, (_, i) => ({
  x: Math.round(Math.random() * 100),
  y: Math.round(Math.random() * 100),
  size: Math.round(Math.random() * 40 + 5),
  group: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
}));

export const Bubble_: Story = {
  name: 'Bubble',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Accounts by size & engagement
      </Heading>
      <BubbleChart
        data={bubbleData}
        mapping={{ x: 'x', y: 'y', sizeField: 'size', groupField: 'group' }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Bullet_: Story = {
  name: 'Bullet',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        KPIs vs. target
      </Heading>
      <BulletChart
        data={[
          { label: 'Revenue', value: 84 },
          { label: 'Signups', value: 62 },
          { label: 'NPS', value: 47 },
        ]}
        mapping={{ x: 'label', y: 'value' }}
        aspectRatio="2 / 1"
      />
    </Stack>
  ),
};

const heatmapData = [
  { day: 'Mon', morning: 4, afternoon: 9, evening: 6 },
  { day: 'Tue', morning: 6, afternoon: 12, evening: 5 },
  { day: 'Wed', morning: 8, afternoon: 14, evening: 7 },
  { day: 'Thu', morning: 5, afternoon: 11, evening: 9 },
  { day: 'Fri', morning: 9, afternoon: 16, evening: 12 },
];

export const Heatmap_: Story = {
  name: 'Heatmap',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Sessions by day & time
      </Heading>
      <HeatmapChart
        data={heatmapData}
        mapping={{ x: 'day', y: ['morning', 'afternoon', 'evening'] }}
        showValues
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

const ohlcData = Array.from({ length: 14 }, (_, i) => {
  const open = 100 + Math.round(Math.sin(i / 2) * 10);
  const close = open + Math.round((Math.random() - 0.5) * 12);
  return {
    day: `D${i + 1}`,
    open,
    high: Math.max(open, close) + Math.round(Math.random() * 6),
    low: Math.min(open, close) - Math.round(Math.random() * 6),
    close,
  };
});

export const Candlestick_: Story = {
  name: 'Candlestick',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Price (OHLC)
      </Heading>
      <CandlestickChart
        data={ohlcData}
        mapping={{ x: 'day', y: ['open', 'high', 'low', 'close'] }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

const boxplotData = [
  { group: 'API', low: 20, q1: 45, median: 60, q3: 80, high: 120 },
  { group: 'Web', low: 30, q1: 55, median: 72, q3: 95, high: 150 },
  { group: 'Worker', low: 10, q1: 25, median: 38, q3: 52, high: 90 },
];

export const Boxplot_: Story = {
  name: 'Boxplot',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Latency distribution
      </Heading>
      <BoxplotChart
        data={boxplotData}
        mapping={{ x: 'group', y: ['low', 'q1', 'median', 'q3', 'high'] }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Marimekko_: Story = {
  name: 'Marimekko',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue mix by segment
      </Heading>
      <MarimekkoChart
        data={[
          { segment: 'Enterprise', value: 5200 },
          { segment: 'Mid-market', value: 3100 },
          { segment: 'SMB', value: 1800 },
          { segment: 'Self-serve', value: 900 },
        ]}
        mapping={{ x: 'segment', y: 'value' }}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Sankey_: Story = {
  name: 'Sankey',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Traffic flow
      </Heading>
      <SankeyChart
        nodes={[
          { id: 'visit', label: 'Visit' },
          { id: 'signup', label: 'Sign up' },
          { id: 'bounce', label: 'Bounce' },
          { id: 'paid', label: 'Paid' },
          { id: 'churn', label: 'Churn' },
        ]}
        links={[
          { source: 'visit', target: 'signup', value: 520 },
          { source: 'visit', target: 'bounce', value: 680 },
          { source: 'signup', target: 'paid', value: 310 },
          { source: 'signup', target: 'churn', value: 210 },
        ]}
        aspectRatio="16 / 9"
      />
    </Stack>
  ),
};

export const Network_: Story = {
  name: 'Network',
  render: () => (
    <Stack gap="2" style={{ width: '32rem' }}>
      <Heading as="h3" size="sm">
        Service dependencies
      </Heading>
      <NetworkChart
        nodes={[
          { id: 'web', group: 'frontend' },
          { id: 'api', group: 'backend' },
          { id: 'auth', group: 'backend' },
          { id: 'db', group: 'data' },
          { id: 'cache', group: 'data' },
        ]}
        links={[
          { source: 'web', target: 'api' },
          { source: 'api', target: 'auth' },
          { source: 'api', target: 'db' },
          { source: 'api', target: 'cache' },
        ]}
        aspectRatio="1 / 1"
      />
    </Stack>
  ),
};
