import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider } from '../../../theme/index.js';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Inline } from './Inline.js';

const meta: Meta<typeof Inline> = {
  title: 'Layout/Inline',
  component: Inline,
  parameters: { layout: 'padded' },
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Inline>;

const Pill = ({ children }: { children: React.ReactNode }) => (
  <Box paddingX="3" paddingY="1" background="accent.soft" color="accent.solid" borderRadius="full">
    <Text size="sm" weight="medium">
      {children}
    </Text>
  </Box>
);

export const Playground: Story = {
  args: { gap: '2', align: 'center', justify: 'start', wrap: true },
  render: (args) => (
    <Inline {...args}>
      <Pill>one</Pill>
      <Pill>two</Pill>
      <Pill>three</Pill>
      <Pill>four</Pill>
    </Inline>
  ),
};

// ── gap scale ─────────────────────────────────────────────────────────

export const Gaps: Story = {
  render: () => (
    <Stack gap="4">
      {(['1', '2', '3', '4', '6'] as const).map((gap) => (
        <Stack key={gap} gap="2">
          <Text variant="overline">gap=&quot;{gap}&quot;</Text>
          <Inline gap={gap}>
            <Pill>one</Pill>
            <Pill>two</Pill>
            <Pill>three</Pill>
          </Inline>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── Wrap (default) ────────────────────────────────────────────────────

export const WrapDefault: Story = {
  name: 'wrap (default) — chip row',
  render: () => (
    <Inline gap="2" maxWidth="360px">
      {Array.from({ length: 14 }, (_, i) => `tag-${i + 1}`).map((tag) => (
        <Pill key={tag}>{tag}</Pill>
      ))}
    </Inline>
  ),
};

// ── No wrap ───────────────────────────────────────────────────────────

export const NoWrap: Story = {
  name: 'wrap=false — horizontal scroll',
  render: () => (
    <Inline gap="2" wrap={false} maxWidth="360px" overflowX="auto" padding="1">
      {Array.from({ length: 14 }, (_, i) => `n-${i + 1}`).map((tag) => (
        <Pill key={tag}>{tag}</Pill>
      ))}
    </Inline>
  ),
};

// ── align ─────────────────────────────────────────────────────────────

export const Align: Story = {
  render: () => (
    <Stack gap="5">
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <Stack key={align} gap="2">
          <Text variant="overline">align=&quot;{align}&quot;</Text>
          <Inline
            gap="3"
            align={align}
            minHeight="80px"
            background="bg.subtle"
            padding="2"
            borderRadius="md"
          >
            <Box padding="2" background="bg.surface" borderRadius="sm">
              <Text size="sm">short</Text>
            </Box>
            <Box padding="4" background="bg.surface" borderRadius="sm">
              <Text size="lg">taller</Text>
            </Box>
            <Box padding="6" background="bg.surface" borderRadius="sm">
              <Heading level={4}>tallest</Heading>
            </Box>
          </Inline>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── justify ───────────────────────────────────────────────────────────

export const Justify: Story = {
  render: () => (
    <Stack gap="5">
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
        <Stack key={justify} gap="2">
          <Text variant="overline">justify=&quot;{justify}&quot;</Text>
          <Inline gap="2" justify={justify} padding="2" background="bg.subtle" borderRadius="md">
            <Pill>A</Pill>
            <Pill>B</Pill>
            <Pill>C</Pill>
          </Inline>
        </Stack>
      ))}
    </Stack>
  ),
};

// ── Responsive gap ────────────────────────────────────────────────────

export const ResponsiveGap: Story = {
  render: () => (
    <Stack gap="3">
      <Text color="fg.muted">Resize the viewport — gap steps through 1 → 3 → 6 at base/md/lg.</Text>
      <Inline gap={{ base: '1', md: '3', lg: '6' }}>
        <Pill>one</Pill>
        <Pill>two</Pill>
        <Pill>three</Pill>
        <Pill>four</Pill>
      </Inline>
    </Stack>
  ),
};

// ── Realistic: toolbar ─────────────────────────────────────────────────

export const Toolbar: Story = {
  render: () => (
    <Inline
      gap="2"
      align="center"
      padding="2"
      background="bg.surface"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      borderRadius="md"
      width="full"
      maxWidth="520px"
    >
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm" weight="semibold">
          B
        </Text>
      </Box>
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm" italic>
          I
        </Text>
      </Box>
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm" underline>
          U
        </Text>
      </Box>
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm" strikethrough>
          S
        </Text>
      </Box>
      <Box paddingX="2">
        <Text size="sm" color="fg.muted">
          |
        </Text>
      </Box>
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm">Align</Text>
      </Box>
      <Box padding="1" paddingX="2" background="bg.subtle" borderRadius="sm">
        <Text size="sm">Bullets</Text>
      </Box>
    </Inline>
  ),
};

// ── RTL ───────────────────────────────────────────────────────────────

export const Rtl: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <Inline gap="2" align="center">
        <Pill>واحد</Pill>
        <Pill>اثنان</Pill>
        <Pill>ثلاثة</Pill>
      </Inline>
    </DirectionProvider>
  ),
};
