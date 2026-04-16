import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from './Heading.js';

const meta: Meta<typeof Heading> = {
  title: 'Typography/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Heading>;

export const Levels: Story = {
  render: () => (
    <Stack gap="3">
      <Heading level={1}>h1 — Headline</Heading>
      <Heading level={2}>h2 — Section</Heading>
      <Heading level={3}>h3 — Subsection</Heading>
      <Heading level={4}>h4 — Minor</Heading>
      <Heading level={5}>h5 — Tight</Heading>
      <Heading level={6}>h6 — Label</Heading>
    </Stack>
  ),
};

export const Decoupled: Story = {
  render: () => (
    <Stack gap="3">
      <Heading level={1} size="xs">
        h1 rendered at body-xs
      </Heading>
      <Heading level={3} size="5xl">
        h3 rendered at 5xl
      </Heading>
    </Stack>
  ),
};

export const Truncated: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Heading truncate level={2}>
        Single-line truncated heading that runs long
      </Heading>
      <Heading truncate={2} level={2} size="md">
        Two-line clamp heading — wraps before hitting the clamp and then truncates with an ellipsis
        when content exceeds the line count.
      </Heading>
    </Stack>
  ),
};
