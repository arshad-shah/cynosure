import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from './Text.js';

const meta: Meta<typeof Text> = {
  title: 'Typography/Text',
  component: Text,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Text size="xs">The quick brown fox jumps — xs</Text>
      <Text size="sm">The quick brown fox jumps — sm</Text>
      <Text size="md">The quick brown fox jumps — md</Text>
      <Text size="lg">The quick brown fox jumps — lg</Text>
      <Text size="xl">The quick brown fox jumps — xl</Text>
    </Stack>
  ),
};

export const Weights: Story = {
  render: () => (
    <Stack gap="2">
      <Text weight="regular">Regular</Text>
      <Text weight="medium">Medium</Text>
      <Text weight="semibold">Semibold</Text>
      <Text weight="bold">Bold</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="2">
      <Text variant="body">Body — the default content voice.</Text>
      <Text variant="caption">Caption — smaller, muted</Text>
      <Text variant="overline">Overline — uppercase label</Text>
      <Text variant="lead" size="lg">
        Lead — introduces a section with slightly relaxed line-height.
      </Text>
    </Stack>
  ),
};

export const Truncation: Story = {
  render: () => (
    <Stack gap="4" width="300px">
      <Text truncate>
        Single-line truncation: a very long string that will overflow and show an ellipsis.
      </Text>
      <Text truncate={3}>
        Multi-line clamp at 3 lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
        nostrud exercitation ullamco laboris.
      </Text>
    </Stack>
  ),
};

export const Decorations: Story = {
  render: () => (
    <Stack gap="2">
      <Text italic>Italic text</Text>
      <Text underline>Underlined</Text>
      <Text strikethrough>Struck through</Text>
      <Text underline decorationColor="accent.solid">
        Accent underline
      </Text>
    </Stack>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Text size={{ base: 'sm', md: 'lg', xl: 'xl' }}>
      Resize the viewport — sm → lg → xl across breakpoints.
    </Text>
  ),
};
