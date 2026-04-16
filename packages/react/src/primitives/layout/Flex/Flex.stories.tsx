import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Flex } from './Flex.js';

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Flex>;

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
    <Flex direction="row" gap="3" align="center">
      <Card>A</Card>
      <Card>B</Card>
      <Card>C</Card>
    </Flex>
  ),
};

export const RowReverse: Story = {
  render: () => (
    <Flex direction="row-reverse" gap="2">
      <Card>1st child (visually last)</Card>
      <Card>2nd</Card>
      <Card>3rd</Card>
    </Flex>
  ),
};

export const Baseline: Story = {
  render: () => (
    <Flex direction="row" align="baseline" gap="4">
      <span style={{ fontSize: '1rem' }}>1rem</span>
      <span style={{ fontSize: '2rem' }}>2rem</span>
      <span style={{ fontSize: '1.25rem' }}>1.25rem</span>
    </Flex>
  ),
};

export const GrowShrink: Story = {
  render: () => (
    <Flex direction="row" gap="2">
      <Box padding="3" background="accent.soft" borderRadius="sm" style={{ flexShrink: 0 }}>
        fixed
      </Box>
      <Flex direction="row" grow={1} background="bg.subtle" padding="3" borderRadius="sm">
        grow=1 (fills remaining space)
      </Flex>
    </Flex>
  ),
};
