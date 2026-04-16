import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Divider } from './Divider.js';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <Stack gap="4" width="320px">
      <Box padding="2">above</Box>
      <Divider />
      <Box padding="2">below</Box>
      <Divider variant="dashed" />
      <Box padding="2">dashed</Box>
      <Divider variant="dotted" thickness="2" />
      <Box padding="2">dotted, thickness 2</Box>
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Inline gap="4" align="center" height="60px">
      <Box>left</Box>
      <Divider orientation="vertical" />
      <Box>middle</Box>
      <Divider orientation="vertical" variant="dashed" />
      <Box>right</Box>
    </Inline>
  ),
};
