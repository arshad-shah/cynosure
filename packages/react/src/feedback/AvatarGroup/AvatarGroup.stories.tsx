import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Avatar } from '../Avatar/Avatar.js';
import { AvatarGroup } from './AvatarGroup.js';

const meta: Meta<typeof AvatarGroup> = {
  title: 'Feedback/AvatarGroup',
  component: AvatarGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { control: 'select', options: ['circle', 'square', 'rounded'] },
    ring: { control: 'boolean' },
    max: { control: { type: 'number', min: 0, max: 20 } },
  },
};
export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const PEOPLE = [
  'Ada Lovelace',
  'Grace Hopper',
  'Barbara Liskov',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Alan Turing',
  'Donald Knuth',
  'Edsger Dijkstra',
  'Linus Torvalds',
  'Dennis Ritchie',
] as const;

export const Playground: Story = {
  args: { size: 'md', shape: 'circle', ring: true, max: 4 },
  render: (args) => (
    <AvatarGroup {...args}>
      {PEOPLE.slice(0, 6).map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  ),
};

export const Basic: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Barbara Liskov" />
    </AvatarGroup>
  ),
};

export const Overflow: Story = {
  name: 'Overflow — max collapses excess into +N',
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <AvatarGroup max={3}>
          {PEOPLE.slice(0, 5).map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Text size="sm" color="fg.muted">
          max = 3 of 5
        </Text>
      </Inline>
      <Inline gap="3" align="center">
        <AvatarGroup max={4}>
          {PEOPLE.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Text size="sm" color="fg.muted">
          max = 4 of {PEOPLE.length}
        </Text>
      </Inline>
      <Inline gap="3" align="center">
        <AvatarGroup max={0}>
          {PEOPLE.slice(0, 3).map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Text size="sm" color="fg.muted">
          max = 0 — everything collapses
        </Text>
      </Inline>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Inline key={size} gap="3" align="center">
          <Text size="sm" color="fg.muted" style={{ width: 40 }}>
            {size}
          </Text>
          <AvatarGroup size={size} max={4}>
            {PEOPLE.slice(0, 6).map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Stack gap="3">
      {(['circle', 'rounded', 'square'] as const).map((shape) => (
        <AvatarGroup key={shape} shape={shape} max={4}>
          {PEOPLE.slice(0, 6).map((name) => (
            <Avatar key={name} name={name} shape={shape} />
          ))}
        </AvatarGroup>
      ))}
    </Stack>
  ),
};

export const NoRing: Story = {
  name: 'Without ring — flat stack',
  render: () => (
    <Stack gap="3">
      <AvatarGroup ring>
        {PEOPLE.slice(0, 4).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup ring={false}>
        {PEOPLE.slice(0, 4).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </Stack>
  ),
};

export const CustomOverflow: Story = {
  name: 'Custom renderOverflow — e.g. link to a full list',
  render: () => (
    <AvatarGroup
      max={3}
      renderOverflow={(count) => <Avatar initials={`+${count}`} colorScheme="violet" />}
    >
      {PEOPLE.slice(0, 7).map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  ),
};

export const Reviewers: Story = {
  name: 'Realistic — PR reviewers list',
  render: () => (
    <Inline gap="3" align="center">
      <Text size="sm" weight="medium">
        Reviewed by
      </Text>
      <AvatarGroup size="sm" max={5}>
        {PEOPLE.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </Inline>
  ),
};
