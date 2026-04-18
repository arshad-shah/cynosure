import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Stack } from '../Stack/Stack.js';
import { Center } from './Center.js';

const meta: Meta<typeof Center> = {
  title: 'Layout/Center',
  component: Center,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Center>;

// ── Default: both-axis centering ──────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Center minHeight="240px" background="bg.subtle" borderRadius="md" padding="3">
      <Box
        padding="4"
        background="bg.surface"
        borderRadius="sm"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        <Text weight="semibold">Centred on both axes</Text>
      </Box>
    </Center>
  ),
};

// ── Horizontal centering only ────────────────────────────────────────

export const HorizontalOnly: Story = {
  name: 'Horizontal only (auto margins)',
  render: () => (
    <Stack gap="3" background="bg.subtle" padding="4" borderRadius="md" minHeight="160px">
      <Text color="fg.muted">
        Using Box with <code>marginX=&quot;auto&quot;</code> centres a single child horizontally
        without changing the flow.
      </Text>
      <Box
        width="240px"
        marginX="auto"
        padding="3"
        background="bg.surface"
        borderRadius="sm"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        <Text>Horizontally centred</Text>
      </Box>
    </Stack>
  ),
};

// ── Viewport-height centering ────────────────────────────────────────

export const FullScreenCenter: Story = {
  name: 'Full-viewport centering',
  render: () => (
    <Center style={{ minHeight: '80vh' }} background="bg.canvas" borderRadius="md">
      <Stack gap="3" align="center">
        <Box
          width="64px"
          height="64px"
          background="accent.solid"
          color="accent.onSolid"
          borderRadius="full"
        >
          <Center width="full" height="full">
            <Text weight="bold">42</Text>
          </Center>
        </Box>
        <Heading level={2} size="xl">
          Welcome back
        </Heading>
        <Text color="fg.muted">Use Center + minHeight=&quot;screen&quot; for a splash.</Text>
      </Stack>
    </Center>
  ),
};

// ── Centering inside a known-sized box ───────────────────────────────

export const InsideBox: Story = {
  name: 'Inside a fixed-size box',
  render: () => (
    <Box
      width="320px"
      height="180px"
      background="accent.soft"
      color="accent.solid"
      borderRadius="md"
    >
      <Center width="full" height="full">
        <Text weight="semibold">320 × 180 pane</Text>
      </Center>
    </Box>
  ),
};

// ── Absolute-positioning pattern ─────────────────────────────────────

export const AbsoluteCenter: Story = {
  name: 'Absolute-positioning pattern',
  render: () => (
    <Box
      position="relative"
      minHeight="220px"
      background="bg.subtle"
      borderRadius="md"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        background="bg.subtle"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.04) 12px, rgba(0,0,0,0.04) 24px)',
        }}
      />
      <Center position="absolute" top="0" left="0" right="0" bottom="0">
        <Box
          padding="3"
          background="bg.surface"
          borderRadius="md"
          boxShadow="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Text weight="semibold">Floating centre</Text>
        </Box>
      </Center>
    </Box>
  ),
};

// ── As a button icon wrapper ─────────────────────────────────────────

export const CircleWithIcon: Story = {
  render: () => (
    <Box
      as="button"
      type="button"
      width="48px"
      height="48px"
      background="accent.solid"
      color="accent.onSolid"
      borderRadius="full"
      style={{ border: 0, cursor: 'pointer' }}
    >
      <Center width="full" height="full">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Center>
    </Box>
  ),
};

// ── AsChild ──────────────────────────────────────────────────────────

export const AsChild: Story = {
  name: 'asChild — onto an anchor',
  render: () => (
    <Center asChild minHeight="160px" background="bg.subtle" borderRadius="md">
      <a
        href="https://cynosure.dev"
        style={{
          color: 'var(--cynosure-color-accent-solid)',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Clickable centred surface
      </a>
    </Center>
  ),
};
