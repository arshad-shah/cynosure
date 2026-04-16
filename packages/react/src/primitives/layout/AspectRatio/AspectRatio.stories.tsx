import type { Meta, StoryObj } from '@storybook/react';
import { Center } from '../Center/Center.js';
import { AspectRatio } from './AspectRatio.js';

const meta: Meta<typeof AspectRatio> = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AspectRatio>;

const Pane = ({ label }: { label: string }) => (
  <Center
    width="full"
    height="full"
    background="accent.soft"
    color="accent.solid"
    borderRadius="md"
  >
    {label}
  </Center>
);

export const Sixteen9: Story = {
  render: () => (
    <div style={{ width: '480px' }}>
      <AspectRatio ratio={16 / 9}>
        <Pane label="16 / 9" />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div style={{ width: '240px' }}>
      <AspectRatio ratio={1}>
        <Pane label="1 / 1" />
      </AspectRatio>
    </div>
  ),
};

export const Ultrawide: Story = {
  render: () => (
    <div style={{ width: '520px' }}>
      <AspectRatio ratio="21 / 9">
        <Pane label="21 / 9" />
      </AspectRatio>
    </div>
  ),
};
