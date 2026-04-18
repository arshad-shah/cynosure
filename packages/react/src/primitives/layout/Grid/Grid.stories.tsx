import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Grid } from './Grid.js';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <Box
    padding="4"
    background="accent.soft"
    color="accent.solid"
    borderRadius="sm"
    style={{ textAlign: 'center' }}
  >
    <Text weight="semibold">{children}</Text>
  </Box>
);

export const Playground: Story = {
  args: { columns: 3, gap: '3' },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }, (_, i) => `p-${i}`).map((id, i) => (
        <Cell key={id}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

// ── columns shorthand ─────────────────────────────────────────────────

export const ColumnsShorthand: Story = {
  render: () => (
    <Stack gap="5">
      {([2, 3, 4, 6] as const).map((n) => (
        <Stack key={n} gap="2">
          <Text variant="overline">columns=&#123;{n}&#125;</Text>
          <Grid columns={n} gap="3">
            {Array.from({ length: n * 2 }, (_, i) => `c${n}-${i}`).map((id, i) => (
              <Cell key={id}>{i + 1}</Cell>
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── Responsive columns ────────────────────────────────────────────────

export const ResponsiveColumns: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.muted">
        Columns adapt: 1 → 2 → 3 → 4 across <code>base/sm/md/lg</code>.
      </Text>
      <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="3">
        {Array.from({ length: 8 }, (_, i) => `r-${i}`).map((id, i) => (
          <Cell key={id}>{i + 1}</Cell>
        ))}
      </Grid>
    </Stack>
  ),
};

// ── templateColumns (explicit mixed tracks) ───────────────────────────

export const ExplicitTemplate: Story = {
  render: () => (
    <Stack gap="5">
      <Stack gap="2">
        <Text variant="overline">
          templateColumns=&quot;200px 1fr 200px&quot; — classic three-pane
        </Text>
        <Grid templateColumns="200px 1fr 200px" gap="3">
          <Cell>sidebar</Cell>
          <Cell>main</Cell>
          <Cell>aside</Cell>
        </Grid>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">
          templateColumns=&quot;repeat(auto-fit, minmax(160px, 1fr))&quot;
        </Text>
        <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap="3">
          {Array.from({ length: 6 }, (_, i) => `auto-${i}`).map((id, i) => (
            <Cell key={id}>{i + 1}</Cell>
          ))}
        </Grid>
      </Stack>
    </Stack>
  ),
};

// ── templateRows ──────────────────────────────────────────────────────

export const RowsAndAutoRows: Story = {
  render: () => (
    <Stack gap="5">
      <Stack gap="2">
        <Text variant="overline">rows=&#123;3&#125; columns=&#123;3&#125;</Text>
        <Grid rows={3} columns={3} gap="2">
          {Array.from({ length: 9 }, (_, i) => `rc-${i}`).map((id, i) => (
            <Cell key={id}>{i + 1}</Cell>
          ))}
        </Grid>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">templateRows=&quot;80px 120px auto&quot;</Text>
        <Grid templateRows="80px 120px auto" columns={1} gap="2" width="320px">
          <Cell>80px</Cell>
          <Cell>120px</Cell>
          <Cell>auto</Cell>
        </Grid>
      </Stack>
    </Stack>
  ),
};

// ── Child spans ───────────────────────────────────────────────────────

export const ChildSpans: Story = {
  render: () => (
    <Grid columns={4} gap="3">
      <Box gridColumn="span 2" padding="4" background="accent.soft" borderRadius="sm">
        <Text weight="semibold">gridColumn=&quot;span 2&quot;</Text>
      </Box>
      <Cell>A</Cell>
      <Cell>B</Cell>
      <Cell>C</Cell>
      <Box gridColumn="span 3" padding="4" background="accent.soft" borderRadius="sm">
        <Text weight="semibold">gridColumn=&quot;span 3&quot;</Text>
      </Box>
      <Box
        gridColumn="1 / -1"
        padding="4"
        background="accent.solid"
        color="accent.onSolid"
        borderRadius="sm"
      >
        <Text weight="semibold">gridColumn=&quot;1 / -1&quot; (full row)</Text>
      </Box>
    </Grid>
  ),
};

// ── row + column gap independently ────────────────────────────────────

export const SeparateGaps: Story = {
  render: () => (
    <Grid columns={4} rowGap="8" columnGap="2">
      {Array.from({ length: 8 }, (_, i) => `g-${i}`).map((id, i) => (
        <Cell key={id}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

// ── Align & justify ────────────────────────────────────────────────────

export const AlignAndJustify: Story = {
  render: () => (
    <Grid
      columns={3}
      gap="3"
      align="center"
      justify="center"
      minHeight="200px"
      background="bg.subtle"
      borderRadius="md"
      padding="3"
    >
      <Box padding="2" background="bg.surface" borderRadius="sm">
        <Text size="sm">Aligned</Text>
      </Box>
      <Box padding="5" background="bg.surface" borderRadius="sm">
        <Text size="sm">Different sizes</Text>
      </Box>
      <Box padding="3" background="bg.surface" borderRadius="sm">
        <Text size="sm">Centred</Text>
      </Box>
    </Grid>
  ),
};

// ── Realistic: dashboard tiles ─────────────────────────────────────────

export const DashboardTiles: Story = {
  render: () => (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
      {[
        { title: 'Active users', value: '12,482', hint: '+4.1%' },
        { title: 'Errors', value: '37', hint: '-18%' },
        { title: 'Latency (p95)', value: '312ms', hint: 'steady' },
        { title: 'Revenue', value: '$84,120', hint: '+6.4% MoM' },
      ].map((t) => (
        <Box
          key={t.title}
          padding="4"
          background="bg.surface"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Stack gap="1">
            <Text color="fg.muted" size="sm">
              {t.title}
            </Text>
            <Heading level={3} size="2xl">
              {t.value}
            </Heading>
            <Text color="fg.subtle" size="sm">
              {t.hint}
            </Text>
          </Stack>
        </Box>
      ))}
    </Grid>
  ),
};

// ── Two-column app shell ──────────────────────────────────────────────

export const AppShell: Story = {
  render: () => (
    <Grid
      templateColumns={{ base: '1fr', md: '240px minmax(0, 1fr)' }}
      templateRows="56px minmax(0, 1fr)"
      gap="0"
      minHeight="360px"
      background="bg.canvas"
      borderRadius="md"
      overflow="hidden"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
    >
      <Box
        gridColumn={{ base: '1', md: '1 / -1' }}
        padding="3"
        background="bg.surface"
        borderWidth="0"
        style={{ borderBottom: '1px solid var(--cynosure-color-border-default)' }}
      >
        <Text weight="semibold">Header</Text>
      </Box>
      <Box display={{ base: 'none', md: 'block' }} padding="3" background="bg.subtle">
        <Text size="sm" color="fg.muted">
          Sidebar
        </Text>
      </Box>
      <Box padding="4">
        <Text>Main content</Text>
      </Box>
    </Grid>
  ),
};
