import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Center } from './Center.js';

const meta: Meta<typeof Center> = {
  title: 'Layout/Center',
  component: Center,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Center>;

export const Default: Story = {
  render: () => (
    <Center minHeight="240px" background="bg.subtle" borderRadius="md">
      <Box padding="4" background="bg.surface" borderRadius="sm">
        Centred
      </Box>
    </Center>
  ),
};
