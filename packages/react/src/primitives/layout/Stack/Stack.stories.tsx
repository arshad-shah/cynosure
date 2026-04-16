import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Stack } from './Stack.js';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Stack>;

const Card = ({ children }: { children: React.ReactNode }) => (
  <Box
    padding="3"
    background="bg.surface"
    borderWidth="1"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius="sm"
  >
    {children}
  </Box>
);

export const Default: Story = {
  render: () => (
    <Stack gap="3">
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </Stack>
  ),
};

export const WithDividers: Story = {
  render: () => (
    <Stack gap="3" dividers>
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </Stack>
  ),
};

export const AlignJustify: Story = {
  render: () => (
    <Stack
      gap="2"
      align="center"
      justify="between"
      minHeight="240px"
      background="bg.subtle"
      padding="4"
      borderRadius="md"
    >
      <Card>top</Card>
      <Card>middle</Card>
      <Card>bottom</Card>
    </Stack>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Stack gap={{ base: '1', md: '4', lg: '6' }}>
      <Card>Gap 1 on mobile</Card>
      <Card>Gap 4 from md</Card>
      <Card>Gap 6 from lg</Card>
    </Stack>
  ),
};
