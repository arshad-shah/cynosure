import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Blockquote } from './Blockquote.js';

const meta: Meta<typeof Blockquote> = {
  title: 'Typography/Blockquote',
  component: Blockquote,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  render: () => (
    <Blockquote attribution="Tim Berners-Lee">
      The Web is more a social creation than a technical one.
    </Blockquote>
  ),
};

export const Callout: Story = {
  render: () => (
    <Stack gap="4" width="520px">
      <Blockquote variant="callout">
        Designers care about hierarchy; screen readers and SEO care about semantics. Use
        <code> level </code> for semantics and <code> size </code> for looks.
      </Blockquote>
    </Stack>
  ),
};
