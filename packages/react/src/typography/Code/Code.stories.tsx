import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { Code } from './Code.js';

const meta: Meta<typeof Code> = {
  title: 'Typography/Code',
  component: Code,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Code>;

export const Inline: Story = {
  render: () => (
    <Text>
      Install with <Code>pnpm install @lumen/react</Code> and import{' '}
      <Code colorScheme="accent">{'import { Text } from "@lumen/react"'}</Code>.
    </Text>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="2">
      <Text>
        <Code colorScheme="neutral">neutral</Code>
      </Text>
      <Text>
        <Code colorScheme="accent">accent</Code>
      </Text>
      <Text>
        <Code colorScheme="success">success</Code>
      </Text>
      <Text>
        <Code colorScheme="danger">danger</Code>
      </Text>
    </Stack>
  ),
};

export const Block: Story = {
  render: () => <Code variant="block">{'const x = 1;\nconst y = x + 1;\nconsole.log(y);'}</Code>,
};
