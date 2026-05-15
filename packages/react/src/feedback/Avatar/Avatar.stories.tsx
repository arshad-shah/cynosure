import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Avatar } from './Avatar.js';

const meta: Meta<typeof Avatar> = {
  title: 'Feedback/Avatar',
  component: Avatar,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { control: 'select', options: ['circle', 'square', 'rounded'] },
    status: { control: 'select', options: [undefined, 'online', 'offline', 'away', 'busy'] },
    ring: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

// Small inline portrait icon for icon-only fallback.
const PersonIcon = (): React.ReactElement => (
  <svg aria-hidden="true" width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z" />
  </svg>
);

// A publicly resolvable image used for the image story.
const EXAMPLE_IMG =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces';

export const Playground: Story = {
  args: {
    name: 'Ada Lovelace',
    size: 'md',
    shape: 'circle',
  },
};

export const Image: Story = {
  name: 'Image — src with alt',
  render: () => (
    <Inline gap="3" align="center">
      <Avatar src={EXAMPLE_IMG} name="Ada Lovelace" />
      <Avatar src={EXAMPLE_IMG} name="Ada Lovelace" size="lg" />
      <Avatar src={EXAMPLE_IMG} name="Ada Lovelace" size="2xl" shape="rounded" />
    </Inline>
  ),
};

export const Initials: Story = {
  name: 'Initials — colorFromName deterministic palette',
  render: () => (
    <Inline gap="3" align="center" wrap>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Barbara Liskov" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Margaret Hamilton" />
      <Avatar name="Alan Turing" />
      <Avatar name="Donald Knuth" />
      <Avatar name="Edsger Dijkstra" />
    </Inline>
  ),
};

export const IconFallback: Story = {
  name: 'Icon fallback — no name, no src',
  render: () => (
    <Inline gap="3" align="center">
      <Avatar icon={<PersonIcon />} />
      <Avatar icon={<PersonIcon />} size="lg" colorScheme="blue" />
      <Avatar icon={<PersonIcon />} size="xl" colorScheme="teal" shape="rounded" />
      <Avatar icon={<PersonIcon />} size="2xl" colorScheme="violet" shape="square" />
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Ada Lovelace" size="xl" />
      <Avatar name="Ada Lovelace" size="2xl" />
    </Inline>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Avatar name="Ada Lovelace" shape="circle" size="lg" />
      <Avatar name="Ada Lovelace" shape="rounded" size="lg" />
      <Avatar name="Ada Lovelace" shape="square" size="lg" />
    </Inline>
  ),
};

export const StatusDots: Story = {
  name: 'Status — online / offline / away / busy',
  render: () => (
    <Stack gap="4">
      <Inline gap="3" align="center">
        <Avatar name="Ada Lovelace" status="online" size="lg" />
        <Avatar name="Grace Hopper" status="offline" size="lg" />
        <Avatar name="Barbara Liskov" status="away" size="lg" />
        <Avatar name="Alan Turing" status="busy" size="lg" />
      </Inline>
      <Inline gap="3" align="center">
        <Avatar name="Ada Lovelace" status="online" statusPosition="top-right" size="lg" />
        <Avatar name="Grace Hopper" status="online" statusPosition="bottom-right" size="lg" />
        <Text size="sm" color="fg.muted">
          top-right vs bottom-right
        </Text>
      </Inline>
    </Stack>
  ),
};

export const Ring: Story = {
  name: 'Ring — focus-ring-style border',
  render: () => (
    <Inline gap="3" align="center">
      <Avatar name="Ada Lovelace" ring />
      <Avatar name="Grace Hopper" ring size="lg" />
      <Avatar name="Barbara Liskov" ring size="xl" shape="rounded" />
      <Avatar src={EXAMPLE_IMG} name="Ada Lovelace" ring size="xl" />
    </Inline>
  ),
};

export const ProfileCard: Story = {
  name: 'Realistic — profile card',
  render: () => (
    <Inline gap="3" align="center">
      <Avatar name="Ada Lovelace" src={EXAMPLE_IMG} size="xl" status="online" ring />
      <Stack gap="1">
        <Text weight="semibold">Ada Lovelace</Text>
        <Text size="sm" color="fg.muted">
          Staff engineer · Online
        </Text>
      </Stack>
    </Inline>
  ),
};

export const BrokenImage: Story = {
  name: 'Edge case — broken image falls back to initials',
  render: () => (
    <Inline gap="3" align="center">
      <Avatar src="https://invalid.example/does-not-exist.jpg" name="Ada Lovelace" size="lg" />
      <Text size="sm" color="fg.muted">
        When the image fails to load, the fallback reveals automatically.
      </Text>
    </Inline>
  ),
};

export const LongName: Story = {
  name: 'Edge case — long names still yield 2-char initials',
  render: () => (
    <Inline gap="3" align="center" wrap>
      <Avatar name="María de los Ángeles Fernández" size="lg" />
      <Avatar name="Björk Guðmundsdóttir" size="lg" />
      <Avatar name="X Æ A-12" size="lg" />
      <Avatar name="Prince" size="lg" />
    </Inline>
  ),
};
