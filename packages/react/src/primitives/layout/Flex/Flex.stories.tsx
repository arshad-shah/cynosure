import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Flex } from './Flex.js';

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: { layout: 'padded' },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
    },
    wrap: { control: 'select', options: ['wrap', 'nowrap', 'wrap-reverse'] },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Flex>;

const Card = ({ children, size }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) => (
  <Box
    padding="3"
    paddingY={size === 'lg' ? '5' : size === 'sm' ? '2' : '3'}
    background="bg.surface"
    borderWidth="1"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius="sm"
  >
    {children}
  </Box>
);

export const Playground: Story = {
  args: { direction: 'row', gap: '3', align: 'center', justify: 'start', wrap: 'wrap' },
  render: (args) => (
    <Flex {...args}>
      <Card>1</Card>
      <Card>2</Card>
      <Card>3</Card>
      <Card>4</Card>
    </Flex>
  ),
};

// ── direction ─────────────────────────────────────────────────────────

export const Directions: Story = {
  render: () => (
    <Stack gap="5">
      {(['row', 'column', 'row-reverse', 'column-reverse'] as const).map((direction) => (
        <Stack key={direction} gap="2">
          <Text variant="overline">direction=&quot;{direction}&quot;</Text>
          <Flex direction={direction} gap="2">
            <Card>A</Card>
            <Card>B</Card>
            <Card>C</Card>
          </Flex>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── align ─────────────────────────────────────────────────────────────

export const AlignItems: Story = {
  render: () => (
    <Stack gap="5">
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <Stack key={align} gap="2">
          <Text variant="overline">align=&quot;{align}&quot;</Text>
          <Flex
            direction="row"
            gap="3"
            align={align}
            minHeight="80px"
            background="bg.subtle"
            borderRadius="md"
            padding="2"
          >
            <Card size="sm">sm</Card>
            <Card size="md">md</Card>
            <Card size="lg">lg</Card>
          </Flex>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── justify ───────────────────────────────────────────────────────────

export const JustifyContent: Story = {
  render: () => (
    <Stack gap="5">
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
        <Stack key={justify} gap="2">
          <Text variant="overline">justify=&quot;{justify}&quot;</Text>
          <Flex
            direction="row"
            gap="2"
            justify={justify}
            padding="2"
            background="bg.subtle"
            borderRadius="md"
          >
            <Card>A</Card>
            <Card>B</Card>
            <Card>C</Card>
          </Flex>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── gap ───────────────────────────────────────────────────────────────

export const Gaps: Story = {
  render: () => (
    <Stack gap="5">
      {(['1', '3', '6', '10'] as const).map((gap) => (
        <Stack key={gap} gap="2">
          <Text variant="overline">gap=&quot;{gap}&quot;</Text>
          <Flex direction="row" gap={gap}>
            <Card>A</Card>
            <Card>B</Card>
            <Card>C</Card>
            <Card>D</Card>
          </Flex>
        </Stack>
      ))}
      <Stack gap="2">
        <Text variant="overline">rowGap=&quot;6&quot; columnGap=&quot;1&quot;</Text>
        <Flex wrap="wrap" rowGap="6" columnGap="1" maxWidth="360px">
          {Array.from({ length: 10 }, (_, i) => `k-${i}`).map((id, i) => (
            <Card key={id}>{i + 1}</Card>
          ))}
        </Flex>
      </Stack>
    </Stack>
  ),
};

// ── wrap ──────────────────────────────────────────────────────────────

export const Wrapping: Story = {
  render: () => (
    <Stack gap="5">
      <Stack gap="2">
        <Text variant="overline">wrap=&quot;wrap&quot; (default)</Text>
        <Flex wrap="wrap" gap="2" maxWidth="320px">
          {Array.from({ length: 12 }, (_, i) => `w-${i}`).map((id, i) => (
            <Card key={id}>chip-{i + 1}</Card>
          ))}
        </Flex>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">wrap=&quot;nowrap&quot; (with horizontal scroll)</Text>
        <Flex wrap="nowrap" gap="2" maxWidth="320px" overflowX="auto" padding="1">
          {Array.from({ length: 12 }, (_, i) => `n-${i}`).map((id, i) => (
            <Card key={id}>chip-{i + 1}</Card>
          ))}
        </Flex>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">wrap=&quot;wrap-reverse&quot;</Text>
        <Flex wrap="wrap-reverse" gap="2" maxWidth="320px">
          {Array.from({ length: 8 }, (_, i) => `r-${i}`).map((id, i) => (
            <Card key={id}>chip-{i + 1}</Card>
          ))}
        </Flex>
      </Stack>
    </Stack>
  ),
};

// ── grow & shrink & basis ─────────────────────────────────────────────

export const GrowShrinkBasis: Story = {
  name: 'grow / shrink / basis',
  render: () => (
    <Stack gap="4">
      <Stack gap="2">
        <Text variant="overline">grow=1 fills remaining space</Text>
        <Flex direction="row" gap="2">
          <Card>fixed</Card>
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            <Text weight="semibold">grow=1</Text>
          </Flex>
          <Card>fixed</Card>
        </Flex>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">equal grow — 1 : 1 : 1</Text>
        <Flex direction="row" gap="2">
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            1
          </Flex>
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            1
          </Flex>
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            1
          </Flex>
        </Flex>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">weighted grow — 1 : 2 : 3</Text>
        <Flex direction="row" gap="2">
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            1
          </Flex>
          <Flex grow={2} background="accent.soft" padding="3" borderRadius="sm">
            2
          </Flex>
          <Flex grow={3} background="accent.soft" padding="3" borderRadius="sm">
            3
          </Flex>
        </Flex>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">basis + shrink</Text>
        <Flex direction="row" gap="2">
          <Flex basis="200px" shrink={0} background="bg.subtle" padding="3" borderRadius="sm">
            basis=200px shrink=0
          </Flex>
          <Flex grow={1} background="accent.soft" padding="3" borderRadius="sm">
            grow=1
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  ),
};

// ── Baseline alignment ─────────────────────────────────────────────────

export const BaselineAlignment: Story = {
  render: () => (
    <Flex direction="row" align="baseline" gap="4">
      <Text size="xs">xs</Text>
      <Text size="md">md</Text>
      <Text size="xl" weight="bold">
        xl bold
      </Text>
      <Heading level={3} size="2xl">
        2xl heading
      </Heading>
    </Flex>
  ),
};

// ── Responsive direction ───────────────────────────────────────────────

export const ResponsiveDirection: Story = {
  render: () => (
    <Stack gap="3">
      <Text color="fg.muted">
        Resize the viewport — direction switches from column → row at md.
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: '2', md: '4' }}>
        <Card>A</Card>
        <Card>B</Card>
        <Card>C</Card>
      </Flex>
    </Stack>
  ),
};

// ── Realistic: media row ──────────────────────────────────────────────

export const MediaRow: Story = {
  name: 'Realistic — media row',
  render: () => (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      gap="4"
      align={{ base: 'stretch', sm: 'center' }}
    >
      <Box
        width="96px"
        height="96px"
        borderRadius="md"
        background="accent.solid"
        color="accent.onSolid"
      >
        <Flex justify="center" align="center" width="full" height="full">
          <Text weight="bold" size="xl">
            L
          </Text>
        </Flex>
      </Box>
      <Flex direction="column" gap="1" grow={1}>
        <Heading level={4} size="lg">
          Luna Park
        </Heading>
        <Text color="fg.muted">Product engineer · San Francisco</Text>
        <Text>A tinkerer at heart who builds things she wants to use.</Text>
      </Flex>
      <Flex direction="row" gap="2" shrink={0}>
        <Box
          padding="2"
          paddingX="3"
          background="accent.soft"
          color="accent.solid"
          borderRadius="sm"
        >
          Follow
        </Box>
        <Box padding="2" paddingX="3" background="bg.subtle" borderRadius="sm">
          Message
        </Box>
      </Flex>
    </Flex>
  ),
};
