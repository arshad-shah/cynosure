import type { Meta, StoryObj } from '@storybook/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  chartSeriesProps,
} from './Chart.js';

const meta: Meta = {
  title: 'Data display/Chart',
  parameters: { layout: 'padded' },
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

const revenueConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--cynosure-color-accent-solid)' },
  cost: { label: 'Cost', color: 'var(--cynosure-color-feedback-danger-solid)' },
};

export const Line_: Story = {
  name: 'Line',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Revenue vs. cost
      </Heading>
      <ChartContainer config={revenueConfig} aspectRatio="16 / 9">
        <LineChart data={revenueData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip />
          <ChartLegend />
          <Line
            type="monotone"
            dataKey="revenue"
            {...chartSeriesProps(revenueConfig, 'revenue')}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            {...chartSeriesProps(revenueConfig, 'cost')}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
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
      <ChartContainer config={revenueConfig} aspectRatio="16 / 9">
        <BarChart data={revenueData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip />
          <Bar
            dataKey="revenue"
            {...chartSeriesProps(revenueConfig, 'revenue')}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </Stack>
  ),
};

export const Area_: Story = {
  name: 'Area',
  render: () => (
    <Stack gap="2" style={{ width: '40rem' }}>
      <Heading as="h3" size="sm">
        Traffic
      </Heading>
      <ChartContainer
        config={{ sessions: { label: 'Sessions', color: 'var(--cynosure-color-accent-solid)' } }}
        aspectRatio="16 / 9"
      >
        <AreaChart data={revenueData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--cynosure-color-accent-solid)"
            fill="var(--cynosure-color-accent-soft)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </Stack>
  ),
};

const pieData = [
  { name: 'north', value: 400 },
  { name: 'south', value: 300 },
  { name: 'east', value: 300 },
  { name: 'west', value: 200 },
];
const pieConfig: ChartConfig = {
  north: { label: 'North', color: 'var(--cynosure-color-accent-solid)' },
  south: { label: 'South', color: 'var(--cynosure-color-feedback-info-solid)' },
  east: { label: 'East', color: 'var(--cynosure-color-feedback-success-solid)' },
  west: { label: 'West', color: 'var(--cynosure-color-feedback-warning-solid)' },
};

export const Pie_: Story = {
  name: 'Pie',
  render: () => (
    <Stack gap="2" style={{ width: '24rem' }}>
      <Heading as="h3" size="sm">
        Region split
      </Heading>
      <ChartContainer config={pieConfig} aspectRatio="1 / 1">
        <PieChart>
          <ChartTooltip />
          <ChartLegend />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {pieData.map((d) => (
              <Text
                as="span"
                key={d.name}
                color="fg.muted"
                style={{ display: 'none' }}
                data-cell-color={pieConfig[d.name]?.color}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </Stack>
  ),
};
