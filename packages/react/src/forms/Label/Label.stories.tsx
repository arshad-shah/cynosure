import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Input } from '../Input/Input.js';
import { Label } from './Label.js';

const meta: Meta<typeof Label> = {
  title: 'Forms/Label',
  component: Label,
  parameters: { layout: 'padded' },
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Playground: Story = {
  args: {
    children: 'Email address',
    required: false,
    disabled: false,
  },
};

export const Default: Story = {
  render: () => <Label>Email address</Label>,
};

export const Required: Story = {
  render: () => (
    <Stack gap="3">
      <Label>Normal label</Label>
      <Label required>Required label</Label>
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Stack gap="3">
      <Label>Enabled</Label>
      <Label disabled>Disabled</Label>
      <Label disabled required>
        Disabled + required
      </Label>
    </Stack>
  ),
};

export const WiredToInput: Story = {
  name: 'htmlFor — clicking label focuses the input',
  render: () => (
    <Stack gap="2" width="320px">
      <Label htmlFor="email-demo" required>
        Email
      </Label>
      <Input id="email-demo" type="email" placeholder="you@example.com" />
    </Stack>
  ),
};

export const RichChildren: Story = {
  name: 'Children — text + inline elements',
  render: () => (
    <Stack gap="3" width="360px">
      <Label>
        Password{' '}
        <Text size="xs" color="fg.muted" as="span">
          (min 8 chars)
        </Text>
      </Label>
      <Label required>
        API key <code>sk-…</code>
      </Label>
    </Stack>
  ),
};

export const SideBySide: Story = {
  name: 'Label + control stacks',
  render: () => (
    <Stack gap="4" width="320px">
      <Stack gap="2">
        <Label htmlFor="l-name">Full name</Label>
        <Input id="l-name" placeholder="Ada Lovelace" />
      </Stack>
      <Stack gap="2">
        <Label htmlFor="l-email" required>
          Email
        </Label>
        <Input id="l-email" type="email" placeholder="ada@example.com" />
      </Stack>
      <Stack gap="2">
        <Label htmlFor="l-pw" disabled>
          Password (reset required)
        </Label>
        <Input id="l-pw" type="password" disabled />
      </Stack>
    </Stack>
  ),
};
