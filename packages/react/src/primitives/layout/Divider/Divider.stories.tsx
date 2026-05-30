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
    tone: { control: 'select', options: ['subtle', 'default', 'strong'] },
    labelAlign: { control: 'select', options: ['start', 'center', 'end'] },
    soft: { control: 'boolean' },
    decorative: { control: 'boolean' },
    children: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Divider>;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Stack gap="2">
    <Text size="sm" variant="overline" color="fg.muted">
      {label}
    </Text>
    {children}
  </Stack>
);

// ── Playground ─────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: '1',
    tone: 'default',
    soft: false,
    labelAlign: 'center',
    decorative: true,
    children: '',
  },
  render: (args) => (
    <Stack gap="3" width="360px">
      <Text>above</Text>
      <Divider {...args}>{args.children || undefined}</Divider>
      <Text>below</Text>
    </Stack>
  ),
};

// ── Variants × thickness ───────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <Stack gap="5" width="420px">
      <Row label="Solid · 1">
        <Divider />
      </Row>
      <Row label="Solid · 2">
        <Divider thickness="2" />
      </Row>
      <Row label="Dashed · 1">
        <Divider variant="dashed" />
      </Row>
      <Row label="Dashed · 2">
        <Divider variant="dashed" thickness="2" />
      </Row>
      <Row label="Dotted · 1">
        <Divider variant="dotted" />
      </Row>
      <Row label="Dotted · 2">
        <Divider variant="dotted" thickness="2" />
      </Row>
    </Stack>
  ),
};

// ── Tone & soft edges ──────────────────────────────────────────────────

export const ToneAndSoft: Story = {
  render: () => (
    <Stack gap="5" width="420px">
      <Row label='tone="subtle"'>
        <Divider tone="subtle" />
      </Row>
      <Row label='tone="default" (default)'>
        <Divider />
      </Row>
      <Row label='tone="strong"'>
        <Divider tone="strong" />
      </Row>
      <Row label="soft edges">
        <Divider soft />
      </Row>
      <Row label='soft + dashed + tone="default"'>
        <Divider soft variant="dashed" tone="default" />
      </Row>
    </Stack>
  ),
};

// ── With label ─────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => (
    <Stack gap="5" width="420px">
      <Row label="center (default)">
        <Divider>or continue with</Divider>
      </Row>
      <Row label="start">
        <Divider labelAlign="start">Recent</Divider>
      </Row>
      <Row label="end">
        <Divider labelAlign="end">Archived</Divider>
      </Row>
      <Row label="with icon">
        <Divider>
          <span aria-hidden>★</span>
          <span>Featured</span>
        </Divider>
      </Row>
      <Row label="dashed + soft">
        <Divider variant="dashed" soft>
          2026
        </Divider>
      </Row>
    </Stack>
  ),
};

// ── Vertical — stat row ────────────────────────────────────────────────

export const Vertical: Story = {
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

// ── In a Card ──────────────────────────────────────────────────────────

export const InCard: Story = {
  render: () => (
    <Box
      padding="0"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      width="420px"
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
      <Divider>section</Divider>
      <Box padding="4">
        <Text color="fg.muted" size="sm">
          More content after the labeled divider.
        </Text>
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

// ── In a menu ──────────────────────────────────────────────────────────

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
      width="240px"
    >
      <Stack gap="1">
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Profile</Text>
        </Box>
        <Box role="menuitem" padding="2" borderRadius="sm">
          <Text>Settings</Text>
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
