import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Rating } from './Rating.js';

const meta: Meta<typeof Rating> = {
  title: 'Forms/Rating',
  component: Rating,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    max: { control: { type: 'number', min: 3, max: 10, step: 1 } },
    allowHalf: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Rating>;

export const Playground: Story = {
  args: {
    defaultValue: 3,
    max: 5,
    size: 'md',
    label: 'Rating',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Small
        </Text>
        <Rating size="sm" defaultValue={3} label="Small" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Medium
        </Text>
        <Rating size="md" defaultValue={3} label="Medium" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 60 }}>
          Large
        </Text>
        <Rating size="lg" defaultValue={3} label="Large" />
      </Inline>
    </Stack>
  ),
};

export const Counts: Story = {
  name: 'Custom max (3 / 5 / 10)',
  render: () => (
    <Stack gap="3">
      <Rating max={3} defaultValue={2} label="3-star" />
      <Rating max={5} defaultValue={4} label="5-star (default)" />
      <Rating max={10} defaultValue={7} label="10-star" />
    </Stack>
  ),
};

export const HalfStars: Story = {
  name: 'allowHalf — 0.5 precision',
  render: () => (
    <Stack gap="3">
      <Rating allowHalf defaultValue={2.5} label="2.5 of 5" />
      <Rating allowHalf defaultValue={3.5} label="3.5 of 5" />
      <Rating allowHalf defaultValue={4.5} label="4.5 of 5" size="lg" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Default
        </Text>
        <Rating defaultValue={3} label="Default" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Disabled
        </Text>
        <Rating defaultValue={3} disabled label="Disabled" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Read only
        </Text>
        <Rating defaultValue={4} readOnly label="Read only" />
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 90 }}>
          Required
        </Text>
        <Rating required label="Required" />
      </Inline>
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · keyboard changes aria-valuenow',
  render: () => <Rating defaultValue={3} label="Score" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rating = canvas.getByRole('slider', { name: 'Score' });
    await expect(rating).toHaveAttribute('aria-valuenow', '3');
    rating.focus();
    await expect(rating).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(rating).toHaveAttribute('aria-valuenow', '4');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(rating).toHaveAttribute('aria-valuenow', '2');
    await userEvent.keyboard('{Home}');
    await expect(rating).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect(rating).toHaveAttribute('aria-valuenow', '5');
  },
};
