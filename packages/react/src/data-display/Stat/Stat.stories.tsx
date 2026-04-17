import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../../primitives/layout/Grid/Grid.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Card, CardBody } from '../Card/Card.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { Stat, StatArrow, StatHelp, StatLabel, StatValue } from './Stat.js';

const meta: Meta<typeof Stat> = {
  title: 'Data Display/Stat',
  component: Stat,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Stat>;

export const Basic: Story = {
  render: () => (
    <Stat>
      <StatLabel>Monthly revenue</StatLabel>
      <StatValue>$48,290</StatValue>
      <StatHelp>Up from $42,960 last month</StatHelp>
    </Stat>
  ),
};

export const Grid3Across: Story = {
  name: 'Stat grid (3 across)',
  render: () => (
    <Grid columns={{ base: 1, sm: 3 }} gap="4">
      <Stat>
        <StatLabel>Revenue</StatLabel>
        <StatValue>$48,290</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 12.4%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Active users</StatLabel>
        <StatValue>9,820</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 3.1%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Churn</StatLabel>
        <StatValue>2.1%</StatValue>
        <StatHelp>
          <StatArrow direction="decrease" /> 0.4%
        </StatHelp>
      </Stat>
    </Grid>
  ),
};

export const Increase: Story = {
  render: () => (
    <Stat>
      <StatLabel>New signups</StatLabel>
      <StatValue>1,482</StatValue>
      <StatHelp>
        <StatArrow direction="increase" /> 23.4% vs last week
      </StatHelp>
    </Stat>
  ),
};

export const Decrease: Story = {
  render: () => (
    <Stat>
      <StatLabel>Bounce rate</StatLabel>
      <StatValue>38.2%</StatValue>
      <StatHelp>
        <StatArrow direction="decrease" /> 4.1% vs last week
      </StatHelp>
    </Stat>
  ),
};

export const WithHelpText: Story = {
  name: 'With help text',
  render: () => (
    <Stat>
      <StatLabel>Average session</StatLabel>
      <StatValue>4m 32s</StatValue>
      <StatHelp>Across 18,402 visits over the last 30 days.</StatHelp>
    </Stat>
  ),
};

export const InCards: Story = {
  name: 'In elevated cards',
  render: () => (
    <Grid columns={{ base: 1, md: 3 }} gap="4">
      <Card variant="elevated">
        <CardBody>
          <Stat>
            <StatLabel>MRR</StatLabel>
            <StatValue>$128,040</StatValue>
            <StatHelp>
              <StatArrow direction="increase" /> 8.9% month over month
            </StatHelp>
          </Stat>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardBody>
          <Stat>
            <StatLabel>Net new MRR</StatLabel>
            <StatValue>$12,950</StatValue>
            <StatHelp>
              <StatArrow direction="increase" /> 14.2% MoM
            </StatHelp>
          </Stat>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardBody>
          <Stat>
            <StatLabel>Logo churn</StatLabel>
            <StatValue>1.8%</StatValue>
            <StatHelp>
              <StatArrow direction="decrease" /> 0.3% MoM
            </StatHelp>
          </Stat>
        </CardBody>
      </Card>
    </Grid>
  ),
};

export const LoadingSkeleton: Story = {
  name: 'Loading skeleton wrapper',
  render: () => (
    <Grid columns={{ base: 1, sm: 3 }} gap="4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={`loading-${i.toString()}`} variant="elevated">
          <CardBody>
            <Stack gap="2">
              <Skeleton height={12} width="40%" />
              <Skeleton height={28} width="70%" />
              <Skeleton height={10} width="55%" />
            </Stack>
          </CardBody>
        </Card>
      ))}
    </Grid>
  ),
};

export const Dashboard: Story = {
  name: 'Realistic dashboard row',
  render: () => (
    <Inline gap="6" wrap>
      <Stat>
        <StatLabel>Impressions</StatLabel>
        <StatValue>2.41M</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 5.7%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Clicks</StatLabel>
        <StatValue>128.4K</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 1.2%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>CTR</StatLabel>
        <StatValue>5.33%</StatValue>
        <StatHelp>
          <StatArrow direction="decrease" /> 0.1%
        </StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Conversions</StatLabel>
        <StatValue>4,192</StatValue>
        <StatHelp>
          <StatArrow direction="increase" /> 9.8%
        </StatHelp>
      </Stat>
    </Inline>
  ),
};
