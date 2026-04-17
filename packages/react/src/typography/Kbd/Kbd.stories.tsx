import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../primitives/layout/Box/Box.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../Heading/Heading.js';
import { Text } from '../Text/Text.js';
import { Kbd } from './Kbd.js';

const meta: Meta<typeof Kbd> = {
  title: 'Typography/Kbd',
  component: Kbd,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {
  args: { size: 'md', children: '⌘K' },
};

// ── Single keys ──────────────────────────────────────────────────────

export const SingleKeys: Story = {
  render: () => (
    <Inline gap="2">
      <Kbd>A</Kbd>
      <Kbd>B</Kbd>
      <Kbd>C</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Space</Kbd>
    </Inline>
  ),
};

// ── Sizes ────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Text size="sm" style={{ minWidth: '40px' }} color="fg.muted">
          sm
        </Text>
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="sm">K</Kbd>
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" style={{ minWidth: '40px' }} color="fg.muted">
          md
        </Text>
        <Kbd size="md">⌘</Kbd>
        <Kbd size="md">K</Kbd>
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" style={{ minWidth: '40px' }} color="fg.muted">
          lg
        </Text>
        <Kbd size="lg">⌘</Kbd>
        <Kbd size="lg">K</Kbd>
      </Inline>
    </Stack>
  ),
};

// ── Combination (plus-separated) ─────────────────────────────────────

export const Combinations: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="1" align="center">
        <Kbd>⌘</Kbd>
        <Text color="fg.muted">+</Text>
        <Kbd>K</Kbd>
      </Inline>
      <Inline gap="1" align="center">
        <Kbd>⌘</Kbd>
        <Text color="fg.muted">+</Text>
        <Kbd>⇧</Kbd>
        <Text color="fg.muted">+</Text>
        <Kbd>P</Kbd>
      </Inline>
      <Inline gap="1" align="center">
        <Kbd>Ctrl</Kbd>
        <Text color="fg.muted">+</Text>
        <Kbd>Alt</Kbd>
        <Text color="fg.muted">+</Text>
        <Kbd>Del</Kbd>
      </Inline>
    </Stack>
  ),
};

// ── Os-variant (Mac vs Windows) ──────────────────────────────────────

export const OsVariant: Story = {
  name: 'macOS vs Windows equivalents',
  render: () => (
    <Stack gap="3">
      <Inline gap="4">
        <Stack gap="2">
          <Text variant="overline">macOS</Text>
          <Inline gap="1" align="center">
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </Inline>
          <Inline gap="1" align="center">
            <Kbd>⌥</Kbd>
            <Kbd>Tab</Kbd>
          </Inline>
        </Stack>
        <Stack gap="2">
          <Text variant="overline">Windows/Linux</Text>
          <Inline gap="1" align="center">
            <Kbd>Ctrl</Kbd>
            <Kbd>S</Kbd>
          </Inline>
          <Inline gap="1" align="center">
            <Kbd>Alt</Kbd>
            <Kbd>Tab</Kbd>
          </Inline>
        </Stack>
      </Inline>
    </Stack>
  ),
};

// ── In prose ─────────────────────────────────────────────────────────

export const InProse: Story = {
  render: () => (
    <Stack gap="3" maxWidth="prose">
      <Text>
        To open the command palette, press <Kbd>⌘</Kbd>+<Kbd>K</Kbd>. Then start typing —{' '}
        <Kbd>↑</Kbd> / <Kbd>↓</Kbd> navigate results and <Kbd>Enter</Kbd> commits.
      </Text>
      <Text size="sm" color="fg.muted">
        Tip: hit <Kbd size="sm">?</Kbd> anywhere to see the full shortcut cheat sheet.
      </Text>
    </Stack>
  ),
};

// ── Shortcut table ───────────────────────────────────────────────────

export const ShortcutTable: Story = {
  render: () => (
    <Box
      padding="3"
      background="bg.surface"
      borderRadius="md"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      maxWidth="420px"
    >
      <Stack gap="3">
        <Heading level={4} size="md">
          Keyboard shortcuts
        </Heading>
        <Stack gap="2">
          {[
            { action: 'Open palette', keys: ['⌘', 'K'] },
            { action: 'Save', keys: ['⌘', 'S'] },
            { action: 'Close tab', keys: ['⌘', 'W'] },
            { action: 'Toggle sidebar', keys: ['⌘', 'B'] },
          ].map((row) => (
            <Inline key={row.action} justify="between" align="center">
              <Text>{row.action}</Text>
              <Inline gap="1" align="center">
                {row.keys.map((k) => (
                  <Kbd key={k} size="sm">
                    {k}
                  </Kbd>
                ))}
              </Inline>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Box>
  ),
};

// ── Inside a label/badge ─────────────────────────────────────────────

export const SearchHint: Story = {
  name: 'Inside a search affordance',
  render: () => (
    <Inline
      gap="3"
      align="center"
      paddingY="2"
      paddingX="3"
      background="bg.subtle"
      borderRadius="md"
      width="full"
      maxWidth="360px"
    >
      <Text color="fg.muted">Search…</Text>
      <Inline gap="1" align="center" marginLeft="auto">
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="sm">K</Kbd>
      </Inline>
    </Inline>
  ),
};
