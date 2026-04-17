import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Divider } from '../Divider/Divider.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from './Stack.js';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
  argTypes: {
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Stack>;

const Card = ({ children }: { children: React.ReactNode }) => (
  <Box
    padding="3"
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
  args: { gap: '3', align: 'stretch', justify: 'start' },
  render: (args) => (
    <Stack {...args}>
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </Stack>
  ),
};

// ── gap scale ─────────────────────────────────────────────────────────

export const Gaps: Story = {
  render: () => (
    <Inline gap="5" align="start">
      {(['1', '2', '3', '4', '6'] as const).map((gap) => (
        <Stack key={gap} gap="2">
          <Text variant="overline">gap=&quot;{gap}&quot;</Text>
          <Stack gap={gap} width="160px">
            <Card>A</Card>
            <Card>B</Card>
            <Card>C</Card>
          </Stack>
        </Stack>
      ))}
    </Inline>
  ),
};

// ── align ─────────────────────────────────────────────────────────────

export const Align: Story = {
  render: () => (
    <Inline gap="4" align="start">
      {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
        <Stack key={align} gap="2">
          <Text variant="overline">align=&quot;{align}&quot;</Text>
          <Stack
            gap="2"
            align={align}
            width="200px"
            padding="2"
            background="bg.subtle"
            borderRadius="md"
          >
            <Box
              padding="2"
              background="accent.soft"
              color="accent.solid"
              borderRadius="sm"
              width="fit"
            >
              short
            </Box>
            <Box
              padding="2"
              background="accent.soft"
              color="accent.solid"
              borderRadius="sm"
              width="fit"
            >
              a bit longer
            </Box>
            <Box
              padding="2"
              background="accent.soft"
              color="accent.solid"
              borderRadius="sm"
              width="fit"
            >
              much much longer label
            </Box>
          </Stack>
        </Stack>
      ))}
    </Inline>
  ),
};

// ── justify ───────────────────────────────────────────────────────────

export const Justify: Story = {
  render: () => (
    <Inline gap="4" align="start">
      {(['start', 'center', 'end', 'between'] as const).map((justify) => (
        <Stack key={justify} gap="2">
          <Text variant="overline">justify=&quot;{justify}&quot;</Text>
          <Stack
            gap="2"
            justify={justify}
            minHeight="220px"
            width="140px"
            padding="2"
            background="bg.subtle"
            borderRadius="md"
          >
            <Card>A</Card>
            <Card>B</Card>
            <Card>C</Card>
          </Stack>
        </Stack>
      ))}
    </Inline>
  ),
};

// ── dividers (default) ───────────────────────────────────────────────

export const WithDividers: Story = {
  render: () => (
    <Stack gap="3" dividers width="320px">
      <Card>Inbox</Card>
      <Card>Drafts</Card>
      <Card>Sent</Card>
      <Card>Archive</Card>
    </Stack>
  ),
};

// ── Custom divider node ──────────────────────────────────────────────

export const CustomDivider: Story = {
  name: 'dividers={<Divider variant="dashed" />}',
  render: () => (
    <Stack gap="3" dividers={<Divider variant="dashed" />} width="320px">
      <Card>Inbox</Card>
      <Card>Drafts</Card>
      <Card>Sent</Card>
    </Stack>
  ),
};

// ── Responsive gap ────────────────────────────────────────────────────

export const ResponsiveGap: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.muted">Resize to see gap step through 1 → 4 → 8.</Text>
      <Stack gap={{ base: '1', md: '4', lg: '8' }}>
        <Card>Gap 1 on mobile</Card>
        <Card>Gap 4 from md</Card>
        <Card>Gap 8 from lg</Card>
      </Stack>
    </Stack>
  ),
};

// ── Responsive align ──────────────────────────────────────────────────

export const ResponsiveAlign: Story = {
  render: () => (
    <Stack gap="2">
      <Text color="fg.muted">
        align steps from <code>stretch</code> on mobile to <code>center</code> from md.
      </Text>
      <Stack
        align={{ base: 'stretch', md: 'center' }}
        gap="2"
        padding="2"
        background="bg.subtle"
        borderRadius="md"
      >
        <Card>one</Card>
        <Card>two</Card>
        <Card>three</Card>
      </Stack>
    </Stack>
  ),
};

// ── Nested stacks ────────────────────────────────────────────────────

export const Nested: Story = {
  render: () => (
    <Stack gap="4" width="full" maxWidth="480px">
      <Heading level={3}>Settings</Heading>
      <Stack gap="2" dividers>
        <Stack gap="0.5">
          <Text weight="semibold">Account</Text>
          <Text color="fg.muted" size="sm">
            Manage login credentials and email.
          </Text>
        </Stack>
        <Stack gap="0.5">
          <Text weight="semibold">Notifications</Text>
          <Text color="fg.muted" size="sm">
            Choose how we reach out.
          </Text>
        </Stack>
        <Stack gap="0.5">
          <Text weight="semibold">Appearance</Text>
          <Text color="fg.muted" size="sm">
            Theme, density, and motion.
          </Text>
        </Stack>
      </Stack>
    </Stack>
  ),
};

// ── Form-like layout ─────────────────────────────────────────────────

export const FormLayout: Story = {
  render: () => (
    <Stack gap="4" width="full" maxWidth="360px">
      <Stack gap="2">
        <Text weight="semibold" as="label">
          Email
        </Text>
        <Box
          padding="2"
          paddingX="3"
          background="bg.surface"
          borderRadius="sm"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Text color="fg.muted">you@example.com</Text>
        </Box>
      </Stack>
      <Stack gap="2">
        <Text weight="semibold" as="label">
          Password
        </Text>
        <Box
          padding="2"
          paddingX="3"
          background="bg.surface"
          borderRadius="sm"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Text color="fg.muted">••••••••</Text>
        </Box>
      </Stack>
      <Inline justify="end" gap="2">
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
            Sign in
          </Text>
        </Box>
      </Inline>
    </Stack>
  ),
};

// ── Stack as semantic element ────────────────────────────────────────

export const AsSemantic: Story = {
  name: 'as="ul" (semantic list)',
  render: () => (
    <Stack as="ul" gap="2" style={{ listStyle: 'none', padding: 0 }}>
      {['Alpha', 'Bravo', 'Charlie'].map((item) => (
        <Box
          key={item}
          as="li"
          padding="2"
          paddingX="3"
          background="bg.surface"
          borderRadius="sm"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          {item}
        </Box>
      ))}
    </Stack>
  ),
};
