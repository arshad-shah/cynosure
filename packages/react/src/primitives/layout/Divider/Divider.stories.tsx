import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Divider } from './Divider.js';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    thickness: { control: 'select', options: ['1', '2'] },
    decorative: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: '1',
    decorative: true,
  },
  render: (args) => (
    <Stack gap="3" width="320px">
      <Text>above</Text>
      <Divider {...args} />
      <Text>below</Text>
    </Stack>
  ),
};

// ── Horizontal variants ────────────────────────────────────────────────

export const Horizontal: Story = {
  render: () => (
    <Stack gap="4" width="360px">
      <Stack gap="3">
        <Text size="sm" variant="overline">
          Solid (default)
        </Text>
        <Divider />
      </Stack>
      <Stack gap="3">
        <Text size="sm" variant="overline">
          Dashed
        </Text>
        <Divider variant="dashed" />
      </Stack>
      <Stack gap="3">
        <Text size="sm" variant="overline">
          Dotted
        </Text>
        <Divider variant="dotted" />
      </Stack>
      <Stack gap="3">
        <Text size="sm" variant="overline">
          Thickness 2
        </Text>
        <Divider thickness="2" />
      </Stack>
    </Stack>
  ),
};

// ── Vertical variants ──────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <Inline
      gap="4"
      align="center"
      height="72px"
      padding="3"
      background="bg.subtle"
      borderRadius="md"
    >
      <Text>left</Text>
      <Divider orientation="vertical" />
      <Text>middle</Text>
      <Divider orientation="vertical" variant="dashed" />
      <Text>dashed</Text>
      <Divider orientation="vertical" variant="dotted" thickness="2" />
      <Text>dotted · 2</Text>
    </Inline>
  ),
};

// ── Semantic vs decorative ─────────────────────────────────────────────

export const SemanticVsDecorative: Story = {
  name: 'decorative={false} — announces as separator',
  render: () => (
    <Stack gap="4" width="360px">
      <Box
        padding="3"
        background="bg.surface"
        borderRadius="md"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        <Stack gap="2">
          <Text weight="semibold">Decorative (default)</Text>
          <Text size="sm" color="fg.muted">
            Not announced to assistive tech — use when the divider is purely visual.
          </Text>
          <Text>Above</Text>
          <Divider />
          <Text>Below</Text>
        </Stack>
      </Box>
      <Box
        padding="3"
        background="bg.surface"
        borderRadius="md"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        <Stack gap="2">
          <Text weight="semibold">Semantic</Text>
          <Text size="sm" color="fg.muted">
            <code>decorative=&#123;false&#125;</code> adds <code>role=&quot;separator&quot;</code>{' '}
            so the divider is announced.
          </Text>
          <Text>Above</Text>
          <Divider decorative={false} />
          <Text>Below</Text>
        </Stack>
      </Box>
    </Stack>
  ),
};

// ── Inside a menu ──────────────────────────────────────────────────────

export const InMenu: Story = {
  render: () => (
    <Box
      role="menu"
      padding="2"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      boxShadow="md"
      width="220px"
    >
      <Stack gap="1">
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Profile</Text>
        </Box>
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Settings</Text>
        </Box>
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Preferences</Text>
        </Box>
        <Divider decorative={false} />
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Keyboard shortcuts</Text>
        </Box>
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Changelog</Text>
        </Box>
        <Divider decorative={false} />
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text color="feedback.danger.foreground">Sign out</Text>
        </Box>
      </Stack>
    </Box>
  ),
};

// ── In a Card header ───────────────────────────────────────────────────

export const InCard: Story = {
  render: () => (
    <Box
      padding="0"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      width="400px"
      overflow="hidden"
    >
      <Box padding="4">
        <Heading level={3} size="md">
          Settings
        </Heading>
      </Box>
      <Divider />
      <Box padding="4">
        <Text>Body content lives below the header rule.</Text>
      </Box>
      <Divider />
      <Inline justify="end" padding="3" gap="2">
        <Text color="fg.muted" size="sm">
          Saved
        </Text>
      </Inline>
    </Box>
  ),
};

// ── Stats row with vertical dividers ──────────────────────────────────

export const StatRow: Story = {
  render: () => (
    <Inline
      align="center"
      gap="5"
      padding="4"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
    >
      <Stack gap="0">
        <Text variant="overline">Users</Text>
        <Text size="xl" weight="bold">
          12.4k
        </Text>
      </Stack>
      <Divider orientation="vertical" />
      <Stack gap="0">
        <Text variant="overline">Revenue</Text>
        <Text size="xl" weight="bold">
          $48k
        </Text>
      </Stack>
      <Divider orientation="vertical" />
      <Stack gap="0">
        <Text variant="overline">Latency</Text>
        <Text size="xl" weight="bold">
          312ms
        </Text>
      </Stack>
    </Inline>
  ),
};

// ── Orientation swap at breakpoint (decorative HTML-level demo) ───────

export const OrientationDemo: Story = {
  name: 'Horizontal + vertical together',
  render: () => (
    <Stack gap="4">
      <Stack gap="2" width="320px">
        <Text>Row 1</Text>
        <Divider />
        <Text>Row 2</Text>
      </Stack>
      <Inline gap="4" align="center" padding="3" background="bg.subtle" borderRadius="md">
        <Text>Col 1</Text>
        <Divider orientation="vertical" />
        <Text>Col 2</Text>
        <Divider orientation="vertical" />
        <Text>Col 3</Text>
      </Inline>
    </Stack>
  ),
};
