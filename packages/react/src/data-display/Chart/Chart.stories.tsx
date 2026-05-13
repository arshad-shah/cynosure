import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import {
  AreaChart,
  BarChart,
  DonutChart,
  HBarChart,
  LineChart,
  PieChart,
  RadarChart,
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
