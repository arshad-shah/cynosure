import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider } from '../../../theme/index.js';
import { Box } from './Box.js';

const meta: Meta<typeof Box> = {
  title: 'Layout/Box',
  component: Box,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    padding: '4',
    background: 'bg.surface',
    borderRadius: 'md',
    borderWidth: '1',
    borderStyle: 'solid',
    borderColor: 'border.default',
    children: 'Box content',
  },
};

export const AllProps: Story = {
  render: () => (
    <Box
      padding={{ base: '2', md: '6' }}
      background="accent.soft"
      color="accent.solid"
      borderRadius="lg"
      borderWidth="1"
      borderStyle="solid"
      borderColor="accent.ring"
      boxShadow="md"
      width={{ base: 'full', md: '320px' }}
    >
      Responsive Box · padding 2 → 6, width full → 320px
    </Box>
  ),
};

export const Polymorphic: Story = {
  render: () => (
    <Box
      as="a"
      href="#"
      padding="3"
      background="bg.surface"
      borderRadius="sm"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      color="fg.default"
    >
      as=&quot;a&quot; Box (behaves like an anchor)
    </Box>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Box asChild padding="3" background="accent.soft" borderRadius="md">
      <button type="button">asChild &lt;button&gt;</button>
    </Box>
  ),
};

export const Rtl: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <Box
        padding="4"
        paddingLeft="8"
        background="bg.surface"
        borderRadius="md"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        بكس ·{' '}
        <span style={{ textDecoration: 'underline' }}>
          extra paddingLeft is on the visual left even in RTL (physical prop)
        </span>
      </Box>
    </DirectionProvider>
  ),
};
