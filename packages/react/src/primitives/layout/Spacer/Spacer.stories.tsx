import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Inline } from '../Inline/Inline.js';
import { Spacer } from './Spacer.js';

const meta: Meta<typeof Spacer> = {
  title: 'Layout/Spacer',
  component: Spacer,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Spacer>;

export const InToolbar: Story = {
  render: () => (
    <Inline
      gap="2"
      align="center"
      padding="2"
      background="bg.subtle"
      borderRadius="md"
      width="full"
    >
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Logo
      </Box>
      <Spacer />
      <Box padding="2" background="bg.surface" borderRadius="sm">
        Menu
      </Box>
      <Box padding="2" background="accent.solid" color="accent.onSolid" borderRadius="sm">
        Profile
      </Box>
    </Inline>
  ),
};
