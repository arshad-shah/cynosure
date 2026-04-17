import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Spacer } from './Spacer.js';

const meta: Meta<typeof Spacer> = {
  title: 'Layout/Spacer',
  component: Spacer,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Spacer>;

// ── In a toolbar ──────────────────────────────────────────────────────

export const InToolbar: Story = {
  render: () => (
    <Inline
      gap="2"
      align="center"
      padding="2"
      background="bg.subtle"
      borderRadius="md"
      width="full"
      maxWidth="560px"
    >
      <Box padding="2" background="bg.surface" borderRadius="sm">
        <Text weight="semibold">Logo</Text>
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        <Text size="sm">File</Text>
      </Box>
      <Box padding="2" background="bg.surface" borderRadius="sm">
        <Text size="sm">Edit</Text>
      </Box>
      <Spacer />
      <Box padding="2" background="bg.surface" borderRadius="sm">
        <Text size="sm">Search</Text>
      </Box>
      <Box padding="2" background="accent.solid" color="accent.onSolid" borderRadius="sm">
        <Text size="sm" weight="semibold">
          Profile
        </Text>
      </Box>
    </Inline>
  ),
};

// ── Between two groups ────────────────────────────────────────────────

export const TwoGroups: Story = {
  name: 'Between two groups',
  render: () => (
    <Inline
      align="center"
      gap="3"
      padding="3"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      width="full"
      maxWidth="560px"
    >
      <Heading level={4} size="md">
        Settings
      </Heading>
      <Spacer />
      <Box padding="2" paddingX="3" background="bg.subtle" borderRadius="sm">
        <Text size="sm">Cancel</Text>
      </Box>
      <Box
        padding="2"
        paddingX="3"
        background="accent.solid"
        color="accent.onSolid"
        borderRadius="sm"
      >
        <Text size="sm" weight="semibold">
          Save
        </Text>
      </Box>
    </Inline>
  ),
};

// ── Multiple spacers (distribute) ─────────────────────────────────────

export const MultipleSpacers: Story = {
  render: () => (
    <Stack gap="3">
      <Text>
        Two <code>&lt;Spacer /&gt;</code>s distribute remaining space equally — the middle item ends
        up centred.
      </Text>
      <Inline padding="3" background="bg.subtle" borderRadius="md" width="full" maxWidth="520px">
        <Box padding="2" background="accent.soft" color="accent.solid" borderRadius="sm">
          left
        </Box>
        <Spacer />
        <Box padding="2" background="accent.soft" color="accent.solid" borderRadius="sm">
          centre
        </Box>
        <Spacer />
        <Box padding="2" background="accent.soft" color="accent.solid" borderRadius="sm">
          right
        </Box>
      </Inline>
    </Stack>
  ),
};

// ── In a vertical Stack ───────────────────────────────────────────────

export const VerticalFill: Story = {
  name: 'Push content to bottom of a Stack',
  render: () => (
    <Stack
      gap="3"
      minHeight="280px"
      padding="4"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      width="full"
      maxWidth="320px"
    >
      <Heading level={4}>Sidebar</Heading>
      <Text color="fg.muted">Main nav</Text>
      <Text>Overview</Text>
      <Text>Projects</Text>
      <Text>Issues</Text>
      <Spacer />
      <Box padding="3" background="bg.subtle" borderRadius="sm">
        <Text size="sm">Pinned at the bottom</Text>
      </Box>
    </Stack>
  ),
};

// ── Sticky footer pattern ─────────────────────────────────────────────

export const StickyFooter: Story = {
  render: () => (
    <Stack
      gap="0"
      minHeight="320px"
      background="bg.canvas"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      overflow="hidden"
    >
      <Box padding="4" background="bg.surface">
        <Text weight="semibold">Header</Text>
      </Box>
      <Box padding="4">
        <Text>Main body (short)</Text>
      </Box>
      <Spacer />
      <Box
        padding="3"
        background="bg.subtle"
        style={{ borderTop: '1px solid var(--lumen-color-border-default)' }}
      >
        <Text size="sm" color="fg.muted">
          Sticky footer — Spacer consumes all leftover space above.
        </Text>
      </Box>
    </Stack>
  ),
};

// ── Under the hood ────────────────────────────────────────────────────

export const Decorative: Story = {
  name: 'aria-hidden by default',
  render: () => (
    <Stack gap="3">
      <Text>
        Spacer renders a hidden <code>&lt;div&gt;</code> (aria-hidden) — it is purely a layout
        utility, never announced to assistive tech.
      </Text>
      <Inline
        align="center"
        padding="3"
        background="bg.subtle"
        borderRadius="md"
        width="full"
        maxWidth="400px"
      >
        <Text>Left</Text>
        <Spacer />
        <Text>Right</Text>
      </Inline>
      <Text size="sm" color="fg.muted">
        Screen readers only see &ldquo;Left&rdquo; then &ldquo;Right&rdquo;.
      </Text>
    </Stack>
  ),
};
