import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Code,
  Grid,
  Heading,
  Inline,
  Link,
  Stack,
  Stat,
  StatHelp,
  StatLabel,
  StatValue,
  Text,
} from '@arshad-shah/cynosure-react';
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
} from '@arshad-shah/cynosure-react/chart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthly = months.map((m, i) => ({
  month: m,
  revenue: 800 + Math.round(Math.sin(i / 2) * 400 + i * 120),
  cost: 400 + Math.round(Math.cos(i / 2) * 200 + i * 60),
  signups: 80 + Math.round(Math.sin(i / 3) * 60 + i * 8),
}));

const traffic = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 6800 },
  { source: 'Referral', visits: 1900 },
  { source: 'Social', visits: 2400 },
  { source: 'Email', visits: 1100 },
];

const radarData = [
  { axis: 'Speed', tigers: 80, dragons: 60, foxes: 70 },
  { axis: 'Power', tigers: 70, dragons: 90, foxes: 65 },
  { axis: 'Range', tigers: 90, dragons: 50, foxes: 80 },
  { axis: 'Stealth', tigers: 50, dragons: 80, foxes: 95 },
  { axis: 'Cost', tigers: 60, dragons: 70, foxes: 50 },
];

const scatter = Array.from({ length: 60 }, (_, i) => ({
  x: i,
  y: Math.round(Math.sin(i / 4) * 50 + 100 + Math.random() * 30),
  group: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
}));

const waterfall = [
  { label: 'Start', value: 1000 },
  { label: 'Q1', value: 250 },
  { label: 'Q2', value: -120 },
  { label: 'Q3', value: 380 },
  { label: 'Q4', value: -90 },
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader>
        <Heading level={3} size="md">
          {title}
        </Heading>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function ChartsPlayground() {
  return (
    <Stack gap="4">
      <Text color="fg.muted">
        Cynosure charts are thin wrappers around{' '}
        <Link href="https://swiftchart.arshadshah.com" target="_blank" rel="noreferrer noopener">
          @arshad-shah/swift-chart
        </Link>{' '}
        — a tiny, zero-dependency Canvas 2D library. We register two themes via SwiftChart's{' '}
        <Code>addTheme</Code> API — <Code>cynosure-light</Code> and <Code>cynosure-dark</Code> —
        built from the same iris/feedback tokens the rest of the library uses. The wrapper picks one
        based on the active scheme; pass <Code>theme</Code> to override. Toggle the page theme to
        verify charts repaint with the new palette.
      </Text>

      <Grid columns={{ base: 1, md: 3 }} gap="4" paddingX="2">
        <ChartCard title="Line · revenue vs. cost">
          <LineChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            smooth
            dots
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Area · monthly revenue">
          <AreaChart
            data={monthly}
            mapping={{ x: 'month', y: 'revenue', seriesNames: ['Revenue'] }}
            smooth
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Bar · monthly signups">
          <BarChart
            data={monthly}
            mapping={{ x: 'month', y: 'signups', seriesNames: ['Signups'] }}
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Stacked bar · revenue + cost">
          <StackedBarChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Stacked area">
          <StackedAreaChart
            data={monthly}
            mapping={{ x: 'month', y: ['revenue', 'cost'], seriesNames: ['Revenue', 'Cost'] }}
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Horizontal bar · traffic">
          <HBarChart data={traffic} mapping={{ x: 'source', y: 'visits' }} aspectRatio="4 / 3" />
        </ChartCard>

        <ChartCard title="Pie · share of traffic">
          <PieChart
            data={traffic}
            mapping={{ labelField: 'source', valueField: 'visits' }}
            aspectRatio="1 / 1"
          />
        </ChartCard>

        <ChartCard title="Donut · share of traffic">
          <DonutChart
            data={traffic}
            mapping={{ labelField: 'source', valueField: 'visits' }}
            donutWidth={0.55}
            aspectRatio="1 / 1"
          />
        </ChartCard>

        <ChartCard title="Scatter · grouped samples">
          <ScatterChart
            data={scatter}
            mapping={{ x: 'x', y: 'y', groupField: 'group' }}
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Radar · capability comparison">
          <RadarChart
            data={radarData}
            mapping={{
              x: 'axis',
              y: ['tigers', 'dragons', 'foxes'],
              seriesNames: ['Tigers', 'Dragons', 'Foxes'],
            }}
            aspectRatio="1 / 1"
          />
        </ChartCard>

        <ChartCard title="Waterfall · quarterly deltas">
          <WaterfallChart
            data={waterfall}
            mapping={{ x: 'label', y: 'value' }}
            aspectRatio="16 / 9"
          />
        </ChartCard>

        <ChartCard title="Sparkline · KPI trend">
          <Inline align="center" gap="4">
            <Stat>
              <StatLabel>Revenue</StatLabel>
              <StatValue>$84.2k</StatValue>
              <StatHelp>+12.4% MoM</StatHelp>
            </Stat>
            <Box flex="1">
              <Sparkline
                data={[12, 14, 13, 18, 22, 24, 21, 26, 30, 32, 28, 35]}
                height={56}
                filled
              />
            </Box>
          </Inline>
        </ChartCard>
      </Grid>
    </Stack>
  );
}
