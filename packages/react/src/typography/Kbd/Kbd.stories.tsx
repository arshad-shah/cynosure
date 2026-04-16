import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Text } from '../Text/Text.js';
import { Kbd } from './Kbd.js';

const meta: Meta<typeof Kbd> = {
  title: 'Typography/Kbd',
  component: Kbd,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Kbd>;

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Kbd size="sm">⌘K</Kbd>
      <Kbd size="md">⌘K</Kbd>
      <Kbd size="lg">⌘K</Kbd>
    </Inline>
  ),
};

export const InSentence: Story = {
  render: () => (
    <Text>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the palette, then <Kbd>Enter</Kbd> to submit.
    </Text>
  ),
};
